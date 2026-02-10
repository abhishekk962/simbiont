import { google } from "@ai-sdk/google";
import { cached } from "@/lib/cacheMiddleware";
import { wrapLanguageModel, gateway } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";

export const baseModel = google("gemini-3-flash-preview")

const CACHE = true;

const isProduction = process.env.NODE_ENV === "production";

export const cachedModel = isProduction ? baseModel : (CACHE ? cached(baseModel) : baseModel);

export const model = isProduction
  ? cachedModel
  : wrapLanguageModel({
      model: cachedModel,
      middleware: devToolsMiddleware(),
    });


export const imageModel = google('gemini-3-flash-image')