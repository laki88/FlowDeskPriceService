const express = require("express");
const dotenv = require("dotenv");
const globalPriceIndexRoute = require("./routes/globalPriceIndex");

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req: import("express").Request, res: import("express").Response) => {
  res.send('Hello, TypeScript with Express!');
});

app.use('/global-price-index', globalPriceIndexRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
