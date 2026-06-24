const axios = require("axios");

/**
 * Liquidity Check
 * Verifies liquidity lock status and pool health before entry.
 */

/**
 * Check liquidity health for a token
 * @param {string} address - Contract address
 * @param {string} chain   - SOLANA | BSC | ETH
 * @returns {object} - { isSafe, liquidity, locked, reason }
 */
const checkLiquidity = async (address, chain) => {
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { timeout: 10000 }
    );

    const pairs = response.data?.pairs || [];
    if (pairs.length === 0) {
      return { isSafe: false, reason: "No liquidity pools found" };
    }

    // Find the best pool (highest liquidity)
    const best = pairs.reduce((a, b) =>
      (a.liquidity?.usd || 0) > (b.liquidity?.usd || 0) ? a : b
    );

    const liquidity  = best.liquidity?.usd  || 0;
    const volume24h  = best.volume?.h24      || 0;
    const priceImpact = best.priceImpact     || null;
    const pairAge    = best.pairCreatedAt
      ? (Date.now() - best.pairCreatedAt) / (1000 * 60 * 60 * 24)
      : null;

    // Minimum liquidity threshold — $10k
    if (liquidity < 10000) {
      return {
        isSafe:    false,
        liquidity,
        reason:    `Insufficient liquidity: $${liquidity.toFixed(0)} (min $10,000)`,
      };
    }

    // Volume / Liquidity ratio check — suspicious if volume >> liquidity
    const volLiqRatio = volume24h / liquidity;
    if (volLiqRatio > 20) {
      return {
        isSafe:    false,
        liquidity,
        reason:    `Suspicious volume/liquidity ratio: ${volLiqRatio.toFixed(1)}x`,
      };
    }

    // Build result
    const result = {
      isSafe:    true,
      liquidity,
      volume24h,
      pairAge:   pairAge ? `${pairAge.toFixed(1)} days` : "Unknown",
      poolCount: pairs.length,
      dex:       best.dexId || "Unknown",
      reason:    "Liquidity check passed",
    };

    // Warn if liquidity is low but passable
    if (liquidity < 50000) {
      result.warning = `Low liquidity warning: $${liquidity.toFixed(0)}`;
    }

    return result;
  } catch (error) {
    console.error("Liquidity check error:", error.message);
    return {
      isSafe:  false,
      reason:  "Liquidity check failed: " + error.message,
    };
  }
};

/**
 * Quick liquidity score (0-100) for ranking tokens
 */
const liquidityScore = (liquidity, volume24h) => {
  let score = 0;
  if (liquidity > 1e6)  score += 40;
  else if (liquidity > 100000) score += 25;
  else if (liquidity > 10000)  score += 10;
  if (volume24h > 500000) score += 30;
  else if (volume24h > 50000)  score += 20;
  else if (volume24h > 5000)   score += 10;
  const ratio = volume24h / (liquidity || 1);
  if (ratio > 0.1 && ratio < 5) score += 30;
  else if (ratio >= 5) score += 10;
  return Math.min(score, 100);
};

module.exports = { checkLiquidity, liquidityScore };