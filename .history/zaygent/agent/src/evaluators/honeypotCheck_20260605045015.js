const axios = require("axios");

/**
 * Honeypot Checker
 * Simulates a buy/sell to detect if a token is a honeypot.
 * Uses honeypot.is API for ETH/BSC and a heuristic check for Solana.
 */

const HONEYPOT_API = "https://api.honeypot.is/v2/IsHoneypot";

/**
 * Check if a token is a honeypot
 * @param {string} address - Contract address
 * @param {string} chain   - SOLANA | BSC | ETH
 * @returns {object} - { isSafe, isHoneypot, reason, taxes }
 */
const checkHoneypot = async (address, chain) => {
  // Solana — use heuristic check (no honeypot.is support)
  if (chain === "SOLANA") {
    return checkSolanaHeuristic(address);
  }

  const chainId = chain === "ETH" ? 1 : chain === "BSC" ? 56 : null;
  if (!chainId) {
    return { isSafe: false, reason: "Unsupported chain for honeypot check" };
  }

  try {
    const response = await axios.get(HONEYPOT_API, {
      params: { address, chainID: chainId },
      timeout: 8000,
    });

    const data = response.data;
    const result = data?.honeypotResult;
    const sim    = data?.simulationResult;

    if (!result) {
      return { isSafe: false, reason: "No honeypot data returned" };
    }

    if (result.isHoneypot) {
      return {
        isSafe:     false,
        isHoneypot: true,
        reason:     result.honeypotReason || "Honeypot detected",
        taxes:      null,
      };
    }

    // Check for excessive taxes
    const buyTax  = sim?.buyTax  || 0;
    const sellTax = sim?.sellTax || 0;

    if (sellTax > 15) {
      return {
        isSafe:     false,
        isHoneypot: false,
        reason:     `High sell tax: ${sellTax}%`,
        taxes:      { buyTax, sellTax },
      };
    }

    return {
      isSafe:     true,
      isHoneypot: false,
      reason:     "Token passed honeypot check",
      taxes:      { buyTax, sellTax },
    };
  } catch (error) {
    console.error("Honeypot check error:", error.message);
    // Fail safe — if API is unreachable, warn but don't block
    return {
      isSafe:  false,
      reason:  "Honeypot API unreachable — proceeding with caution",
      warning: true,
    };
  }
};

/**
 * Solana heuristic check using DEXscreener data
 * Checks for suspicious patterns in pool data
 */
const checkSolanaHeuristic = async (address) => {
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { timeout: 8000 }
    );

    const pair = response.data?.pairs?.[0];
    if (!pair) {
      return { isSafe: false, reason: "Token not found on DEXscreener" };
    }

    const liquidity = pair.liquidity?.usd || 0;
    const volume24h = pair.volume?.h24    || 0;
    const age       = pair.pairCreatedAt
      ? (Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60)
      : 0;

    // Red flags
    if (liquidity < 5000) {
      return { isSafe: false, reason: `Low liquidity: $${liquidity.toFixed(0)}` };
    }
    if (age < 1 && volume24h < 1000) {
      return { isSafe: false, reason: "Very new token with low volume — high risk" };
    }

    return {
      isSafe:  true,
      reason:  "Token passed Solana heuristic check",
      details: { liquidity, volume24h, ageHours: age.toFixed(1) },
    };
  } catch (error) {
    return { isSafe: false, reason: "Solana check failed: " + error.message };
  }
};

module.exports = { checkHoneypot };