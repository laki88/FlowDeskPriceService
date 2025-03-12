// services/priceUtils.js
function calculateMidPrice(bids: string | any[], asks: string | any[]) {
    if (!Array.isArray(bids) || !Array.isArray(asks) || bids.length === 0 || asks.length === 0) {
        return null;
    }

    const bestBid = parseFloat(bids[0][0]);
    const bestAsk = parseFloat(asks[0][0]);

    if (isNaN(bestBid) || isNaN(bestAsk)) {
        console.error("Invalid bid or ask price:", { bestBid, bestAsk });
        return null;
    }

    return (bestBid + bestAsk) / 2;
}

export { calculateMidPrice };