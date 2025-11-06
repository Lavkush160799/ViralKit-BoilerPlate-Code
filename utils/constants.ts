// Wiro API Configuration
export const WIRO_CONFIG = {
  API_KEY: "",
  API_SECRET:
    "",
  BASE_URL: "https://api.wiro.ai/v1",
};

// API Endpoints
export const WIRO_ENDPOINTS = {
  VIRTUAL_TRY_ON: "/Run/wiro/virtual-try-on",
  VIDEO_GENERATION: "/Run/openai/sora-2-pro",
  CAPTION_GENERATION: "/Run/wiro/rag-chat",
  TASK_DETAIL: "/Task/Detail",
};

// Default Configurations
export const DEFAULT_VIDEO_CONFIG = {
  seconds: "4",
  resolution: "720p",
  ratio: "auto",
};

export const DEFAULT_CAPTION_CONFIG = {
  selectedModel: "617", // RAG Chat model ID
  temperature: "0.7",
  top_p: "0.90",
  top_k: "50",
  repetition_penalty: "1.0",
  max_new_tokens: "0",
  seed: "6747892",
  quantization: "--quantization",
  do_sample: "",
  chunk_size: "256",
  chunk_overlap: "25",
  similarity_top_k: "5",
  context_window: "0",
};

export const DEFAULT_TRYON_CONFIG = {
  style: "outdoor",
  pose: "auto",
  plan: "auto",
};

// Polling Configuration
export const POLLING_CONFIG = {
  INTERVAL: 3000, // 3 seconds
  MAX_ATTEMPTS: 60, // 3 minutes max (60 * 3 seconds)
};

// Task Status Values
export const TASK_STATUS = {
  QUEUE: "task_queue",
  START: "task_start",
  OUTPUT: "task_output", // Task is producing output but not complete yet
  COMPLETED: "task_postprocess_end",
  CANCELLED: "task_cancel",
} as const;

// Task statuses that indicate the task is still processing (not failed)
export const PROCESSING_STATUSES = [
  TASK_STATUS.QUEUE,
  TASK_STATUS.START,
  TASK_STATUS.OUTPUT,
];
