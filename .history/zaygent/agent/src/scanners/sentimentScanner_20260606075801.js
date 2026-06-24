const axios = require("axios");
require("dotenv").config();

/**
 * Sentiment Scanner
 * Real sentiment data from:
 * 1. LunarCrush — token-level social score
 * 2. Alternative.me — market-wide Fear & Greed Index
 */

const LUNARCRUSH_URL   = "https://lunarcrush.com/api4/public";
const ALTERNATIVEME_URL = "https://api.alternative.me/fng/";
const LUNARCRUSH_KEY   = process.env.LUNARCRUSH_API_KEY;

const api = axios.create({ timeout: 10000, headers: { "Accept": "application/json" } });

// ── Fear & Greed Index ────────────────────────────────────────────────────────

let fearGreedCache     = null;
let fearGreedCachedAt  = null;
const FEAR_GREED_TTL   = 60 * 60 * 1000; // 1 hour cache

const getFearGreedIndex = async () => {
  // Return cached value if fresh
  if (fearGreedCache && fearGreedCachedAt && Date.now() - fearGreedCachedAt < FEAR_GREED_TTL) {
    return fearGreedCache;
  }

  try {
    const res   = await api.get(ALTERNATIVEME_URL);
    const data  = res.data?.data?.[0];
    if (!data) throw new Error("No data returned");

    const score      = parseInt(data.value);
    const label      = data.value_classification;
    const result = {
      score,
      label,
      normalized: score / 100, // 0-1 scale
      sentiment:  score >= 75 ? "EXTREME_GREED"
                : score >= 55 ? "GREED"
                : score >= 45 ? "NEUTRAL"
                : score >= 25 ? "FEAR"
                : "EXTREME_FEAR",
      // Position sizing multiplier based on market sentiment
      sizeMultiplier: score >= 75 ? 0.5   // extreme greed — be cautious
                    : score >= 55 ? 0.8   // greed — slightly cautious
                    : score >= 45 ? 1.0   // neutral — normal size
                    : score >= 25 ? 1.2   // fear — buy the dip
                    : 0.3,                // extreme fear — very cautious
    };

    fearGreedCache    = result;
    fearGreedCachedAt = Date.now();
    console.log(`✅ Fear & Greed: ${score} (${label})`);
    return result;
  } catch (error) {
    console.warn("⚠️  Fear & Greed fetch error:", error.message);
    // Return neutral as fallback
    return { score: 50, label: "Neutral", normalized: 0.5, sentiment: "NEUTRAL", sizeMultiplier: 1.0 };
  }
};

// ── LunarCrush ────────────────────────────────────────────────────────────────

// Per-token cache
const lunarCache    = new Map();
const LUNAR_TTL     = 15 * 60 * 1000; // 15 min cache per token

const getLunarCrushData = async (symbol) => {
  const cacheKey = symbol.toUpperCase().trim();

  // Return cached value if fresh
  if (lunarCache.has(cacheKey)) {
    const cached = lunarCache.get(cacheKey);
    if (Date.now() - cached.ts < LUNAR_TTL) return cached.data;
  }

  if (!LUNARCRUSH_KEY) {
    console.warn("⚠️  LunarCrush API key not set");
    return null;
  }

  try {
    const res = await api.get(`${LUNARCRUSH_URL}/coins/${cacheKey}/v1`, {
      headers: { Authorization: `Bearer ${LUNARCRUSH_KEY}` },
    });

    const coin = res.data?.data;
    if (!coin) throw new Error("No coin data returned");

    const result = {
      symbol:          coin.symbol,
      galaxyScore:     coin.galaxy_score      || 0,  // 0-100 overall score
      altRank:         coin.alt_rank          || 999, // lower is better
      socialVolume:    coin.social_volume_24h || 0,
      socialScore:     coin.social_score      || 0,
      socialDominance: coin.social_dominance  || 0,
      sentiment:       coin.sentiment         || 0,   // 0-100
      priceScore:      coin.price_score       || 0,
      marketCap:       coin.market_cap        || 0,
      // Derived signal
      signal: coin.galaxy_score >= 70 ? "STRONG_BUY"
            : coin.galaxy_score >= 55 ? "BUY"
            : coin.galaxy_score >= 40 ? "NEUTRAL"
            : coin.galaxy_score >= 25 ? "SELL"
            : "STRONG_SELL",
    };

    lunarCache.set(cacheKey, { data: result, ts: Date.now() });
    console.log(`✅ LunarCrush ${cacheKey}: Galaxy=${result.galaxyScore} AltRank=${result.altRank} Signal=${result.signal}`);
    return result;
  } catch (error) {
    console.warn(`⚠️  LunarCrush ${cacheKey}: ${error.message}`);
    return null;
  }
};

// ── Combined Sentiment ────────────────────────────────────────────────────────

/**
 * Get full sentiment analysis for a token
 * Combines LunarCrush + Fear & Greed
 */
const getSentiment = async (token, chain) => {
  const symbol = token.trim().toUpperCase();

  // Fetch both in parallel
  const [lunarData, fearGreed] = await Promise.all([
    getLunarCrushData(symbol),
    getFearGreedIndex(),
  ]);

  // Build sentiment score
  let score = 50; // default neutral

  if (lunarData) {
    // LunarCrush galaxy score is 0-100 — weight it 70%
    score = (lunarData.galaxyScore * 0.7) + (fearGreed.normalized * 100 * 0.3);
  } else {
    // No LunarCrush data — use fear/greed only with momentum boost
    score = (fearGreed.score * 0.5) + 25; // conservative baseline
  }

  score = Math.max(0, Math.min(100, score));

  const level = score >= 80 ? { label: "VERY BULLISH", color: "#00e5b4" }
              : score >= 60 ? { label: "BULLISH",      color: "#22c55e" }
              : score >= 40 ? { label: "NEUTRAL",      color: "#6b7a8d" }
              : score >= 20 ? { label: "BEARISH",      color: "#f59e0b" }
              : { label: "VERY BEARISH", color: "#ef4444" };

  return {
    token:          symbol,
    chain,
    score:          parseFloat(score.toFixed(1)),
    level:          level.label,
    color:          level.color,
    sizeMultiplier: fearGreed.sizeMultiplier,
    sources: {
      lunarCrush: lunarData ? {
        galaxyScore:  lunarData.galaxyScore,
        altRank:      lunarData.altRank,
        socialVolume: lunarData.socialVolume,
        signal:       lunarData.signal,
      } : null,
      fearGreed: {
        score: fearGreed.score,
        label: fearGreed.label,
        sentiment: fearGreed.sentiment,
      },
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Batch sentiment for multiple tokens
 * Rate limited — 1 request per 200ms to respect LunarCrush limits
 */
const batchSentiment = async (tokens) => {
  const results = [];
  for (const token of tokens) {
    const result = await getSentiment(token.name || token.token, token.chain);
    results.push(result);
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
};

/**
 * Combined conviction score — merges DEX score with sentiment
 */
const combinedScore = (dexScore, sentimentScore) => {
  return parseFloat(((dexScore * 0.6) + (sentimentScore * 0.4)).toFixed(1));
};

module.exports = {
  getSentiment,
  batchSentiment,
  combinedScore,
  getFearGreedIndex,
  getLunarCrushData,
};