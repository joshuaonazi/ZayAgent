const axios = require("axios");
const { liquidityScore } = require("../evaluators/liquidityCheck");

/**
 * DEX Scanner
 * Scans DEXscreener for high-conviction tokens across chains.
 */

const DEXSCREENER_URL = "https://api.dexscreener.com/latest/v1";
const CHAINS = ["solana", "bsc", "ethereum"];

/**
 * Fetch trending pairs from DEXscreener
 */
const fetchTrending = async () => {
  try {
    const response = await axios.get(`${DEXSCREENER_URL}/dex/tokens/trending`, {
      timeout: 15000,
    });
    return response.data?.pairs || [];
  } catch (error) {
    console.error("DEX scan error:", error.message);
    return [];
  }
};

/**
 * Fetch top gainers in last 6 hours
 */
const fetchTopGainers = async (chain = "solana") => {
  try {
    const response = await axios.get(
      `${DEXSCREENER_URL}/dex/pairs/${chain}`,
      { timeout: 15000 }
    );
    const pairs = response.data?.pairs || [];
    return pairs
      .filter(p => (p.priceChange?.h6 || 0) > 20)
      .sort((a, b) => (b.priceChange?.h6 || 0) - (a.priceChange?.h6 || 0))
      .slice(0, 10);
  } catch (error) {
    console.error("Top gainers fetch error:", error.message);
    return [];
  }
};

/**
 * Score a token pair for entry conviction (0-100)
 */
const scoreToken = (pair) => {
  let score = 0;
  const change6h  = pair.priceChange?.h6  || 0;
  const change1h  = pair.priceChange?.h1  || 0;
  const change24h = pair.priceChange?.h24 || 0;
  const liquidity = pair.liquidity?.usd   || 0;
  const volume24h = pair.volume?.h24      || 0;
  const txns1h    = (pair.txns?.h1?.buys  || 0) + (pair.txns?.h1?.sells || 0);

  // Momentum scoring
  if (change1h > 5  && change1h < 50)  score += 25;
  if (change6h > 10 && change6h < 200) score += 20;
  if (change24h > 0) score += 10;

  // Liquidity scoring
  score += liquidityScore(liquidity, volume24h) * 0.3;

  // Transaction activity
  if (txns1h > 100) score += 15;
  else if (txns1h > 50) score += 10;
  else if (txns1h > 20) score += 5;

  // Penalty for extreme moves (likely already pumped)
  if (change1h > 100)  score -= 20;
  if (change6h > 500)  score -= 30;

  return Math.max(0, Math.min(100, score));
};

/**
 * Format a DEXscreener pair into Zaygent token format
 */
const formatToken = (pair) => {
  const chainMap = { ethereum: "ETH", bsc: "BSC", solana: "SOLANA" };
  return {
    name:      pair.baseToken?.symbol || "UNKNOWN",
    address:   pair.baseToken?.address,
    chain:     chainMap[pair.chainId] || pair.chainId?.toUpperCase(),
    price:     parseFloat(pair.priceUsd || 0),
    change1h:  pair.priceChange?.h1  || 0,
    change6h:  pair.priceChange?.h6  || 0,
    change24h: pair.priceChange?.h24 || 0,
    liquidity: pair.liquidity?.usd   || 0,
    volume24h: pair.volume?.h24      || 0,
    mcap:      pair.fdv              || 0,
    dex:       pair.dexId            || "unknown",
    score:     scoreToken(pair),
    pairAddress: pair.pairAddress,
  };
};

/**
 * Run full scan — returns high conviction tokens sorted by score
 */
const runScan = async (minScore = 50) => {
  console.log("🔍 Running DEX scan...");
  const allPairs = await fetchTrending();

  if (allPairs.length === 0) {
    console.warn("⚠️  No pairs returned from DEXscreener");
    return [];
  }

  const tokens = allPairs
    .map(formatToken)
    .filter(t => t.score >= minScore && t.liquidity > 10000)
    .sort((a, b) => b.score - a.score);

  console.log(`✅ Scan complete — ${tokens.length} high-conviction tokens found`);
  return tokens;
};

module.exports = { runScan, fetchTrending, fetchTopGainers, scoreToken, formatToken };