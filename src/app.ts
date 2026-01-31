import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import router from "./routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import path from "path";

const app: Application = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://medi-store-frontend.vercel.app",
    ],
    credentials: true,
  }),
);
// Parsers
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

// Static files for uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Application Routes
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Medi-Store Backend is Running",
  });
});

app.use(globalErrorHandler);

export default app;
