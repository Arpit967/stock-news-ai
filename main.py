from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from groq import Groq
import yfinance as yf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NEWSDATA_KEY = "pub_bde7ff30170b4e87a0d8ed895363ca58"
GROQ_KEY = "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"
client = Groq(api_key=GROQ_KEY)

@app.get("/")
def home():
    return {"message": "Stock News AI is running"}

@app.get("/analyze")
def analyze_news(page: str = None):
    # Step 1: Fetch news with optional pagination
    url = f"https://newsdata.io/api/1/news?apikey={NEWSDATA_KEY}&q=company+stock+market+shares+business&language=en&category=business,technology"
    if page:
        url += f"&page={page}"
    response = requests.get(url)
    data = response.json()
    results = data.get("results") or []
    next_page = data.get("nextPage")
    seen_titles = set()
    unique_results = []
    for r in results:
        title = r.get("title", "")
        if title not in seen_titles:
            seen_titles.add(title)
            unique_results.append(r)
    results = unique_results

    analyzed = []

    for item in results[:5]:
        title = item.get("title") or ""
        description = item.get("description") or ""

        if not title:
            continue

        # Step 2: Ask Groq to extract company + sentiment + ticker
        prompt = f"""
        News headline: {title}
        Description: {description}

        From this news, identify:
        1. The main company or brand name mentioned (just the name, nothing else)
        2. Sentiment: is this news Positive, Negative or Neutral for that company?
        3. The stock ticker symbol. If Indian company, give NSE ticker (e.g. RELIANCE, TCS, INFY, HDFCBANK). If US company, give NASDAQ/NYSE ticker (e.g. AAPL, TSLA, MSFT). If unknown or not a listed company, write UNKNOWN.
        4. Exchange: write NSE if Indian company, US if American company, UNKNOWN if neither.

        Reply in this exact format:
        Company: <name>
        Sentiment: <Positive/Negative/Neutral>
        Ticker: <ticker or UNKNOWN>
        Exchange: <NSE/US/UNKNOWN>
        """

        try:
            groq_response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}]
            )
            ai_text = groq_response.choices[0].message.content.strip()

            # Step 3: Parse Groq response
            lines = ai_text.split("\n")
            company = lines[0].replace("Company:", "").strip()
            sentiment = lines[1].replace("Sentiment:", "").strip()
            ticker = lines[2].replace("Ticker:", "").strip()
            exchange = lines[3].replace("Exchange:", "").strip()

            # Step 4: Fetch stock price based on exchange
            stock_info = None
            if ticker != "UNKNOWN" and exchange != "UNKNOWN":
                try:
                    if exchange == "NSE":
                        stock = yf.Ticker(f"{ticker}.NS")
                    else:
                        stock = yf.Ticker(ticker)

                    hist = stock.history(period="7d")
                    if not hist.empty:
                        closes = [round(float(p), 2) for p in hist["Close"].tolist()]
                        stock_info = {
                            "current_price": round(hist["Close"].iloc[-1], 2),
                            "week_ago_price": round(hist["Close"].iloc[0], 2),
                            "change_percent": round(
                                ((hist["Close"].iloc[-1] - hist["Close"].iloc[0]) / hist["Close"].iloc[0]) * 100, 2
                            ),
                            "price_history": closes
                        }
                except:
                    stock_info = None

                        # Calculate hype score
            if sentiment == "Positive":
                base = 65
            elif sentiment == "Negative":
                base = 20
            else:
                base = 45

            # Boost score based on stock movement
            if stock_info:
                change = abs(stock_info["change_percent"])
                boost = min(int(change * 2), 30)
            else:
                boost = 0

            hype_score = min(base + boost, 99)

            analyzed.append({
                "title": title,
                "company": company,
                "sentiment": sentiment,
                "ticker": ticker,
                "exchange": exchange,
                "stock": stock_info,
                "hype_score": hype_score,
                "link": item.get("link")
            })

        except Exception as e:
            analyzed.append({"error": str(e)})
            continue

    return {"results": analyzed, "nextPage": next_page}