import {
  type LanguageModelV3Middleware,
  type LanguageModelV3StreamPart,
  type LanguageModelV3CallOptions,
  type LanguageModelV3,
} from '@ai-sdk/provider';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { wrapLanguageModel, simulateReadableStream } from 'ai';

const CACHE_FILE = path.join(process.cwd(), '.cache/ai-cache.json');

export const cached = (model: LanguageModelV3) =>
  wrapLanguageModel({
    middleware: cacheMiddleware,
    model,
  });

const ensureCacheFile = () => {
  const cacheDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  if (!fs.existsSync(CACHE_FILE)) {
    fs.writeFileSync(CACHE_FILE, '{}');
  }
};

const getCachedResult = (key: string | object) => {
  ensureCacheFile();
  const cacheKey = typeof key === 'object' ? JSON.stringify(key) : key;
  try {
    const cacheContent = fs.readFileSync(CACHE_FILE, 'utf-8');

    const cache = JSON.parse(cacheContent);

    const result = cache[cacheKey];

    return result ?? null;
  } catch (error) {
    console.error('Cache error:', error);
    return null;
  }
};

const updateCache = (key: string, value: any) => {
  ensureCacheFile();
  try {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const updatedCache = { ...cache, [key]: value };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(updatedCache, null, 2));
  } catch (error) {
    console.error('Failed to update cache:', error);
  }
};

const cleanPrompt = (prompt: LanguageModelV3CallOptions['prompt']) => {
  return prompt.map(m => {
    if (m.role === 'assistant') {
      return {
        ...m,
        content: m.content.map(part =>
          part.type === 'tool-call' ? { ...part, toolCallId: 'cached' } : part,
        ),
      };
    }
    if (m.role === 'tool') {
      return {
        ...m,
        content: m.content.map(tc => ({
          ...tc,
          toolCallId: 'cached',
          result: {},
        })),
      };
    }

    return m;
  });
};

export const cacheMiddleware: LanguageModelV3Middleware = {
  specificationVersion: 'v3',
  wrapGenerate: async ({ doGenerate, params, model }) => {
    const cacheKey = JSON.stringify({
      prompt: cleanPrompt(params.prompt),
      _function: 'generate',
      model: model.modelId,
    });

    const cached = getCachedResult(cacheKey);

    if (cached && cached !== null) {
      return {
        ...cached,
        response: {
          ...cached.response,
          timestamp: cached?.response?.timestamp
            ? new Date(cached?.response?.timestamp)
            : undefined,
        },
      };
    }

    const result = await doGenerate();

    updateCache(cacheKey, result);

    return result;
  },

  wrapStream: async ({ doStream, params, model }) => {
    const cacheKey = JSON.stringify({
      prompt: cleanPrompt(params.prompt),
      _function: 'stream',
      model: model.modelId,
    });

    const cached = getCachedResult(cacheKey);

    if (cached && cached !== null) {
      const { chunks, ...rest } = cached;
      const formattedChunks = (chunks as LanguageModelV3StreamPart[]).map(p => {
        if (p.type === 'response-metadata' && p.timestamp) {
          return { ...p, timestamp: new Date(p.timestamp) };
        }
        return p;
      });

      return {
        stream: simulateReadableStream({
          initialDelayInMs: 0,
          chunkDelayInMs: 10,
          chunks: formattedChunks,
        }),
        ...rest,
      };
    }

    const { stream, ...rest } = await doStream();

    const fullResponse: LanguageModelV3StreamPart[] = [];

    const transformStream = new TransformStream<
      LanguageModelV3StreamPart,
      LanguageModelV3StreamPart
    >({
      transform(chunk, controller) {
        fullResponse.push(chunk);
        controller.enqueue(chunk);
      },

      flush() {
        updateCache(cacheKey, { chunks: fullResponse, ...rest });
      },
    });

    return {
      stream: stream.pipeThrough(transformStream),
      ...rest,
    };
  },
};