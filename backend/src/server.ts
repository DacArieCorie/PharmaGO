import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { authRouter } from "./routes/auth";
import { meRouter } from "./routes/me";
import { addressesRouter } from "./routes/addresses";
import { pharmaciesRouter } from "./routes/pharmacies";
import { productsRouter } from "./routes/products";
import { ordersRouter } from "./routes/orders";
import { couriersRouter } from "./routes/couriers";
import { supportRouter } from "./routes/support";
import { adminRouter } from "./routes/admin";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/pharmacies", pharmaciesRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/couriers", couriersRouter);
app.use("/api/support", supportRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`PharmaGO API listening on port ${PORT}`);
});
