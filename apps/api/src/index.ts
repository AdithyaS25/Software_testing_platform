import express from "express";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "API running" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
