import axios from 'axios';
import WebSocket from 'ws';
import { calculateMidPrice } from '../utils/priceUtils';
import { exchanges, fetchInterval } from '../config/exchanges';

interface ExchangePriceMap {
    [exchangeName: string]: number;
}

let exchangePrices: ExchangePriceMap = {}; // Store mid-prices for each exchange

const processExchangeData = (exchange: any, data: any): void => {
    const orderbook = exchange.extractOrderbook(data);
    
    if (orderbook?.bids && orderbook?.asks) {
        const midPrice = calculateMidPrice(orderbook.bids, orderbook.asks);
        if (midPrice !== null) {
            exchangePrices[exchange.name] = midPrice;
        }
    } else {
        console.error(`Invalid order book data for ${exchange.name}:`, data);
    }
};

// WebSocket connection handler
const connectWebSocket = (exchange: any): void => {
    const ws = new WebSocket(exchange.url);

    ws.on('message', (data: WebSocket.Data) => {
        try {
            const parsedData = JSON.parse(data.toString());
            processExchangeData(exchange, parsedData);
        } catch (error) {
            console.error(`Error processing WebSocket data from ${exchange.name}:`, error);
        }
    });

    ws.on('close', () => {
        console.warn(`${exchange.name} WebSocket closed. Reconnecting...`);
        setTimeout(() => connectWebSocket(exchange), 3000);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error on ${exchange.name}:`, error);
    });
};

// Establish WebSocket connections
exchanges
    .filter((exchange) => exchange.type === 'websocket')
    .forEach(connectWebSocket);

// Fetch order books from REST API exchanges
const fetchOrderbooks = async (): Promise<void> => {
    const restExchanges = exchanges.filter((exchange) => exchange.type === 'rest');

    for (const exchange of restExchanges) {
        try {
            const response = await axios.get(exchange.url);
            processExchangeData(exchange, response.data);
        } catch (error) {
            console.error(`Error fetching ${exchange.name} orderbook:`, error);
        }
    }
};

// Schedule periodic REST API fetching
setInterval(fetchOrderbooks, fetchInterval);

export { exchangePrices };
