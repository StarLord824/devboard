import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "api", v: 2 });
});

app.listen(PORT, () => {
  console.log(`[API] Server is running on port ${PORT}`);
});
