import express, { type Request, type Response } from "express";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Backend is running" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
