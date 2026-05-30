import { useState, useEffect } from "react";

const MOCK_CHARTS = {
  up: [40, 38, 42, 45, 43, 47, 52, 55, 53, 58],
  down: [60, 58, 55, 57, 52, 48, 45, 47, 43, 40],
  flat: [48, 50, 47, 51, 49, 50, 48, 52, 49, 51],
};

function Sparkline({ change, priceHistory }) {
  const data = priceHistory && priceHistory.length > 1 ? priceHistory : 
    change > 1 ? MOCK_CHARTS.up : change < -1 ? MOCK_CHARTS.down : MOCK_CHARTS.flat;
  const color = change > 0 ? "#16a34a" : change < 0 ? "#dc2626" : "#94a3b8";
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 120;
    const y = 30 - ((v - min) / range) * 28;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="120" height="32" viewBox="0 0 120 32">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HypeMeter({ sentiment, score }) {
  score = score || (sentiment === "Positive" ? 70 : sentiment === "Negative" ? 25 : 50);
  const color = sentiment === "Positive" ? "#16a34a" : sentiment === "Negative" ? "#dc2626" : "#d97706";
  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ color: "#94a3b8", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Hype Meter</span>
        <span style={{ color, fontSize: "0.75rem", fontWeight: "700" }}>{score}/100</span>
      </div>
      <div style={{ backgroundColor: "#e2e8f0", borderRadius: "999px", height: "4px", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, backgroundColor: color, height: "100%", borderRadius: "999px", transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

function Card({ item }) {
  const sentimentColor = item.sentiment === "Positive" ? "#16a34a" : item.sentiment === "Negative" ? "#dc2626" : "#d97706";
  const sentimentBg = item.sentiment === "Positive" ? "#f0fdf4" : item.sentiment === "Negative" ? "#fef2f2" : "#fffbeb";
  const change = item.stock?.change_percent ?? 0;
  const changeColor = change >= 0 ? "#16a34a" : "#dc2626";

  let hostname = "";
  try { hostname = new URL(item.link).hostname.replace("www.", ""); } catch {}

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: "16px",
      padding: "22px",
      border: "1px solid rgba(255,255,255,0.9)",
      breakInside: "avoid",
      marginBottom: "20px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "pointer",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)";
      }}
    >
      {/* Company + Sentiment */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <h2 style={{ color: "#0f172a", margin: 0, fontSize: "1.05rem", fontWeight: "700", letterSpacing: "-0.01em" }}>
            {item.company}
          </h2>
          {item.ticker !== "UNKNOWN" && (
            <span style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: "500" }}>
              {item.ticker} · {item.exchange}
            </span>
          )}
        </div>
        <span style={{
          backgroundColor: sentimentBg,
          color: sentimentColor,
          padding: "3px 10px",
          borderRadius: "999px",
          fontSize: "0.72rem",
          fontWeight: "700",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          border: `1px solid ${sentimentColor}33`
        }}>
          {item.sentiment}
        </span>
      </div>

      {/* News title */}
      <p style={{ color: "#475569", fontSize: "0.85rem", lineHeight: "1.5", margin: "0 0 14px" }}>
        {item.title}
      </p>

      {/* Source badge */}
      {hostname && (
        <div style={{ marginBottom: "14px" }}>
          <span style={{
            backgroundColor: "#f1f5f9",
            border: "1px solid #e2e8f0",
            color: "#94a3b8",
            fontSize: "0.7rem",
            padding: "3px 8px",
            borderRadius: "6px",
            letterSpacing: "0.05em"
          }}>
            🔗 {hostname}
          </span>
        </div>
      )}

      {/* Stock info */}
      {item.stock ? (
        <div style={{
          background: "rgba(241,245,249,0.8)",
          borderRadius: "10px",
          padding: "12px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          border: "1px solid #e2e8f0"
        }}>
          <div>
            <p style={{ color: "#94a3b8", fontSize: "0.65rem", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Price</p>
            <p style={{ color: "#0f172a", fontWeight: "700", margin: "2px 0 0", fontSize: "1rem" }}>${item.stock.current_price}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontSize: "0.65rem", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>7D Change</p>
            <p style={{ color: changeColor, fontWeight: "700", margin: "2px 0 0", fontSize: "1rem" }}>
              {change > 0 ? "+" : ""}{change}%
            </p>
          </div>
          <Sparkline change={change} priceHistory={item.stock?.price_history} />
        </div>
      ) : (
        <div style={{ background: "rgba(241,245,249,0.8)", borderRadius: "10px", padding: "10px 14px", marginBottom: "12px", border: "1px solid #e2e8f0" }}>
          <p style={{ color: "#cbd5e1", margin: 0, fontSize: "0.8rem" }}>No stock data available</p>
        </div>
      )}

      <HypeMeter sentiment={item.sentiment} score={item.hype_score} />

      <a href={item.link} target="_blank" rel="noreferrer" style={{
        display: "inline-block",
        marginTop: "14px",
        color: "#2563eb",
        fontSize: "0.78rem",
        textDecoration: "none",
        letterSpacing: "0.03em",
        fontWeight: "500"
      }}>
        Read article →
      </a>
    </div>
  );
}

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextPage, setNextPage] = useState(null);

  const BASE_URL = "https://stock-news-ai-mpo4.onrender.com";

  const fetchData = () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setNextPage(null);
    fetch(`${BASE_URL}/analyze`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setNextPage(data.nextPage || null);
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(() => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  };

  const loadMore = () => {
    if (!nextPage) return;
    setLoadingMore(true);
    fetch(`${BASE_URL}/analyze?page=${nextPage}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(prev => [...prev, ...(data.results || [])]);
        setNextPage(data.nextPage || null);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #dbeafe 0%, #f0f4f8 40%, #ede9fe 100%)",
      fontFamily: "'Inter', 'Arial', sans-serif"
    }}>

      {/* Nav */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.6)",
        padding: "16px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.3rem" }}>📈</span>
          <span style={{ color: "#0f172a", fontWeight: "800", fontSize: "1rem", letterSpacing: "-0.02em" }}>StockNewsAI</span>
          <span style={{
            backgroundColor: "#dcfce7",
            color: "#16a34a",
            fontSize: "0.6rem",
            padding: "2px 7px",
            borderRadius: "999px",
            fontWeight: "700",
            border: "1px solid #bbf7d0",
            letterSpacing: "0.08em"
          }}>LIVE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {lastUpdated && <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Updated {lastUpdated}</span>}
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#e2e8f0" : "#2563eb",
              color: loading ? "#94a3b8" : "#fff",
              border: "none",
              padding: "8px 18px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "700",
            }}
          >
            {loading ? "Analyzing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: "48px 40px 32px", maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{
          color: "#0f172a",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          fontWeight: "800",
          margin: 0,
          letterSpacing: "-0.04em",
          lineHeight: 1.1
        }}>
          Markets move on<br />
          <span style={{ color: "#2563eb" }}>news.</span> We catch it first.
        </h1>
        <p style={{ color: "#64748b", marginTop: "12px", fontSize: "0.95rem" }}>
          AI-powered signals from viral business news → real stock impact.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Scanning news & analyzing markets...</p>
        </div>
      )}

      {error && <p style={{ color: "#dc2626", textAlign: "center", padding: "40px" }}>{error}</p>}

      {/* Grid */}
      {!loading && results.length > 0 && (
        <div style={{ padding: "0 40px 60px", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ columns: "3 300px", columnGap: "20px" }}>
            {results.filter(item => !item.error).map((item, i) => (
              <Card key={i} item={item} />
            ))}
          </div>

          {nextPage && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  backgroundColor: "transparent",
                  color: loadingMore ? "#94a3b8" : "#2563eb",
                  border: "1px solid",
                  borderColor: loadingMore ? "#94a3b8" : "#2563eb",
                  padding: "10px 32px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  cursor: loadingMore ? "not-allowed" : "pointer",
                  fontWeight: "700",
                }}
              >
                {loadingMore ? "Loading more..." : "Load More →"}
              </button>
            </div>
          )}

          {!nextPage && results.length > 0 && (
            <p style={{ textAlign: "center", color: "#cbd5e1", fontSize: "0.8rem", marginTop: "20px" }}>
              You've reached the end
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;