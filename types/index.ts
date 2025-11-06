// Wiro API Response Types
export interface WiroRunResponse {
  taskid: string;
  socketaccesstoken: string;
  result?: any;
  errors?: string[];
}

export interface TaskOutput {
  url: string;
  contenttype: string;
}

export interface TaskItem {
  status: string;
  outputs: TaskOutput[];
  debugoutput?: string;
  debugerror?: string;
  elapsedseconds?: string;
  starttime?: number;
  endtime?: string;
}

export interface TaskDetailResponse {
  tasklist: TaskItem[];
  total?: string;
  errors?: string[];
  result?: boolean;
}

// Content Store Types
export type ContentType = "tryon" | "video" | "caption";
export type ContentStatus = "pending" | "processing" | "completed" | "failed";

export interface ContentItem {
  id: string;
  type: ContentType;
  status: ContentStatus;
  taskId: string;
  socketAccessToken: string;
  originalImage?: string;
  outputs: TaskOutput[];
  caption?: string;
  createdAt: number;
  error?: string;
  // Progress tracking
  progressStatus?: string; // API status like "task_start", "task_postprocess_end"
  progressMessage?: string; // debugoutput from API
  progressPercentage?: number; // Parsed progress percentage (0-100)
  elapsedSeconds?: string; // Time elapsed
}

// API Request Types
export interface TryOnRequest {
  humanImageUri: string;
  clothesImageUri: string;
  style?: string;
  pose?: string;
  plan?: string;
}

export interface VideoGenerationRequest {
  imageUri: string;
  prompt: string;
  seconds?: string;
  resolution?: string;
  ratio?: string;
}

export interface CaptionGenerationRequest {
  imageUri: string; // Required for RAG Chat to analyze the image
  prompt: string;
  systemPrompt?: string;
  temperature?: string;
  topP?: string;
  topK?: string;
  repetitionPenalty?: string;
  maxNewTokens?: string;
  seed?: string;
  chunkSize?: string;
  chunkOverlap?: string;
  similarityTopK?: string;
  contextWindow?: string;
}

// Task Status Types
export type TaskStatus =
  | "task_queue"
  | "task_start"
  | "task_postprocess_end"
  | "task_cancel";

// Authentication Types
export interface WiroAuthHeaders {
  "x-api-key": string;
  "x-nonce": string;
  "x-signature": string;
  "Content-Type": string;
}

export interface SignatureData {
  nonce: string;
  signature: string;
}
