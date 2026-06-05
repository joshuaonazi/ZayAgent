/**
 * Sentiment Scanner
 * Tracks social momentum signals for tokens.
 * In simulation mode — generates realistic sentiment scores.
 * In production — connects to Twitter/X API, Telegram scrapers.
 */

const SENTIMENT_LEVELS = {
  VERY_BULLISH: { label: "VERY BULLISH", score: 90, color: "#00e5b4" },
  BULLISH:      { label: "BULLISH",      score: 70, color: "#22c55e" },
  NEUTRAL:      { label: "NEUTRAL",      score: 50, color: "#6b7a8d" },
  BEARISH:      { label: "BEARISH",      score: 30, color: "#f59e0b" },
  VERY_BEARISH: { label: "VERY BEARISH", score: 10, color: "#ef4444" },
};

/**
 * Generate simulated sentiment score for a token
 * In production this would call Twitter/X API and Telegram scrapers
 */
const getSentiment = async (token, chain) => {
  // Simulate API call delay
  await new Promise(r => setTimeout(r, 100));

  // Simulate sentiment based on token characteristics
  const seed   = token.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base   = (seed % 60) + 20; // 20-80 range
  const noise  = (Math.random() * 20) - 10;
  const score  = Math.max(0, Math.min(100, base + noise));

  const level = score >= 80 ? SENTIMENT_LEVELS.VERY_BULLISH
    : score >= 60 ? SENTIMENT_LEVELS.BULLISH
    : score >= 40 ? SENTIMENT_LEVELS.NEUTRAL
    : score >= 20 ? SENTIMENT_LEVELS.BEARISH
    : SENTIMENT_LEVELS.VERY_BEARISH;

  return {
    token,
    chain,
    score:      parseFloat(score.toFixed(1)),
    level:      level.label,
    color:      level.color,
    signals: {
      twitterMentions:  Math.floor(score * 12),
      telegramMentions: Math.floor(score * 8),
      trendingRank:     score > 70 ? Math.floor(Math.random() * 10) + 1 : null,
      sentiment:        level.label,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Batch sentiment check for multiple tokens
 */
const batchSentiment = async (tokens) => {
  const results = await Promise.all(
    tokens.map(t => getSentiment(t.name || t.token, t.chain))
  );
  return results;
};

/**
 * Combined conviction score — merges DEX score with sentiment
 */
const combinedScore = (dexScore, sentimentScore) => {
  return parseFloat(((dexScore * 0.6) + (sentimentScore * 0.4)).toFixed(1));
};

module.exports = { getSentiment, batchSentiment, combinedScore, SENTIMENT_LEVELS };