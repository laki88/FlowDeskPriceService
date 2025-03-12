export interface Orderbook {
    bids: any;
    asks: any;
  }
  
  export interface Exchange {
    name: string;
    type: 'websocket' | 'rest';
    url: string;
    extractOrderbook: (data: any) => Orderbook | null;
  }
  
  export const exchanges: Exchange[] = [
    {
      name: 'Binance',
      type: 'websocket',
      url: 'wss://stream.binance.com:9443/ws/btcusdt@depth',
      extractOrderbook: (data: { b: any; a: any }) => ({ bids: data.b, asks: data.a })
    },
    {
      name: 'Kraken',
      type: 'rest',
      url: 'https://api.kraken.com/0/public/Depth?pair=XBTUSDT',
      extractOrderbook: (data: any) =>
        data?.result?.XBTUSDT ? { bids: data.result.XBTUSDT.bids, asks: data.result.XBTUSDT.asks } : null
    },
    {
      name: 'Huobi',
      type: 'rest',
      url: 'https://api.huobi.pro/market/depth?symbol=btcusdt&type=step0',
      extractOrderbook: (data: any) =>
        data?.tick ? { bids: data.tick.bids, asks: data.tick.asks } : null
    }
  ];
  
  export const fetchInterval: number = 5000;  // Time interval for REST API updates (milliseconds)
  