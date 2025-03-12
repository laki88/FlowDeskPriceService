import { Router, Request, Response } from "express";
import { exchangePrices } from '../services/exchangeService';

const router = Router();

// Placeholder function for price index calculation
router.get('/', (req: Request, res: Response) => {
    const prices = Object.values(exchangePrices).filter((price): price is number => price !== null);
    
    if (prices.length === 0) {
        // return res.status(500).json({ error: 'No valid price data available' });
    }
    
    const globalPriceIndex = prices.reduce((a, b) => a + b, 0) / prices.length;
    res.json({ globalPriceIndex });
});

export default router;