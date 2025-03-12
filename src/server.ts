import express, { Request, Response } from "express";
import dotenv from "dotenv";
import globalPriceIndexRoute from "./routes/globalPriceIndex";

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use("/global-price-index", globalPriceIndexRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
