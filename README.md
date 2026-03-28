# DAT.co Financial Indicator Monitor

Track MicroStrategy's mNAV (Modified Net Asset Value) — the ratio of market cap to Bitcoin holdings value.

## Quick Start

```bash
npm install
cp .env.example .env.local   # Add your OpenAI key for AI Insights
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What is mNAV?

**mNAV = Market Cap / (BTC Holdings × BTC Price)**

- **> 1.0x** → Market values the company at a premium over its BTC
- **< 1.0x** → Company trades at a discount to its Bitcoin NAV

## Features

- 📊 mNAV time-series chart with BTC price overlay
- 📈 MSTR vs BTC price comparison
- 🎯 Live stats (current mNAV, MSTR price, BTC price)
- 📅 Date range selector (30D – 2Y)
- ✨ AI-powered trend analysis (requires OpenAI API key)
- 🔄 Automatic fallback to cached data if APIs are down

## Data Sources

- **MSTR stock**: Yahoo Finance via `yahoo-finance2`
- **BTC price**: CoinGecko API
- **BTC holdings**: Known MicroStrategy/Strategy IR data

## Deploy to Vercel

```bash
npm run build
vercel
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | No | For AI Insights feature |
