import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Application Routes
// app.use('/api', router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Medi-Store Backend is Running",
  });
});

export default app;
