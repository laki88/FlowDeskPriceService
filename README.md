# Flowdesk - Global Price Index API

## Overview
As a market maker, having a global price index is essential. This project provides a REST API that computes a fair mid-price for the BTC/USDT trading pair by aggregating order book data from multiple exchanges.

The API fetches order book data from the following exchanges:
1. **Binance** (via WebSocket stream)
2. **Kraken** (via REST API)
3. **Huobi** (via REST API)

Each order book's mid-price is calculated as the average between the best bid and best ask prices. The final global price index is determined by averaging the mid-prices from all exchanges.

## Features
- Real-time order book processing from Binance WebSocket.
- Periodic fetching of order book data from Kraken and Huobi REST APIs.
- Computation of the global mid-price index.
- REST API endpoint to retrieve the computed price.
- Scalable design to add more exchanges in the future.

## API Endpoint
The API exposes the following endpoint:
```
GET http://localhost:5000/global-price-index
```
Response:
```json
{
  "global_price_index": 65000.50
}
```

## Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation & Setup
1. Clone the repository (ensure you have access to the private repo):
   ```sh
   git clone https://github.com/laki88/FlowDeskPriceService.git
   cd FlowDeskPriceService
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Running the Project
### Development Mode
Start the server in development mode with hot-reloading:
```sh
npm run dev
```

### Running Tests
Run the tests with following command
```sh
npx jest
```

### Production Mode
Build and start the project for production:
```sh
npm run build
npm run start
```

## Project Structure
```
/FlowDeskPriceService
│── src/
│   ├── server.ts      # Entry point of the application
│   ├── services/      # Exchange API handlers
│   ├── utils/         # Utility functions
│   ├── config/        # Configuration settings
|   ├── routes/        # Api routes
│── dist/              # Compiled TypeScript files (after build)
│── package.json       # Project dependencies and scripts
│── tsconfig.json      # TypeScript configuration
│── jest.config.js     # Test configuration file
```

## Dependencies
### Production Dependencies:
- **Express** - Web framework for Node.js
- **Axios** - HTTP client for making API requests
- **WebSocket (ws)** - WebSocket client for Binance
- **dotenv** - Loads environment variables

### Development Dependencies:
- **TypeScript** - Statically typed JavaScript
- **Nodemon** - Auto-restart for development
- **Jest & Supertest** - Testing framework

## Future Improvements
- Support for additional exchanges
- Caching mechanism for better performance
- More robust error handling and logging

## License
This project is licensed under the **Apache License**.

