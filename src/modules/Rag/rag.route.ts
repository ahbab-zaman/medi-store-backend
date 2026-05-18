import express from "express";
import { RagController } from "./rag.controller";

const router = express.Router();

router.post("/ingest", RagController.ingestDocument);
router.post("/chat", RagController.streamChat);

export const RagRoutes = router;
