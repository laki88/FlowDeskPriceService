const express = require("express");
const { exchangePrices } = require("../services/exchangeService");

const router = express.Router();

// Placeholder function for price index calculation
router.get('/', (req: import("express").Request, res: import("express").Response) => {
  const prices = Object.values(exchangePrices).filter((price): price is number => price !== null);

  if (prices.length === 0) {
    // return res.status(500).json({ error: 'No valid price data available' });
  }

  const globalPriceIndex = prices.reduce((a, b) => a + b, 0) / prices.length;
  res.json({ globalPriceIndex });
});

module.exports = router;
