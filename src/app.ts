import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import path from "path";

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Static files for uploaded images
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads")),
);

// Application Routes
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Medi-Store Backend is Running",
  });
});

app.use(globalErrorHandler);

export default app;
