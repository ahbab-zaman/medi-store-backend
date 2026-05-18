import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RagService } from "./rag.service";

const ingestDocument = catchAsync(async (req: Request, res: Response) => {
  const { title, content, source } = req.body;

  const result = await RagService.ingestDocument({ title, content, source });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Document ingested successfully",
    data: result,
  });
});

const streamChat = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ success: false, message: "Message is required" });
      return;
    }

    await RagService.streamChat({ message, sessionId }, res);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || "Failed to stream chat",
      });
      return;
    }

    res.write(`event: error\ndata: ${JSON.stringify({ message: error?.message || "Streaming failed" })}\n\n`);
    res.end();
  }
};

export const RagController = {
  ingestDocument,
  streamChat,
};
