import axios, { AxiosInstance } from "axios";
import {
  CaptionGenerationRequest,
  TaskDetailResponse,
  TryOnRequest,
  VideoGenerationRequest,
  WiroRunResponse,
} from "../types";
import {
  DEFAULT_CAPTION_CONFIG,
  DEFAULT_TRYON_CONFIG,
  DEFAULT_VIDEO_CONFIG,
  WIRO_CONFIG,
  WIRO_ENDPOINTS,
} from "../utils/constants";
import { generateMultipartHeaders } from "./signature";

/**
 * WiroAPI Service Class
 * Handles all interactions with the Wiro AI API
 */
class WiroAPI {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: WIRO_CONFIG.BASE_URL,
      timeout: 30000, // 30 seconds timeout
    });
  }

  /**
   * Convert image URI to FormData for multipart upload
   */
  private async imageToFormData(
    imageUri: string,
    fieldName: string
  ): Promise<FormData> {
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    // Create file object for FormData
    const file = {
      uri: imageUri,
      name: filename,
      type,
    } as any;

    formData.append(fieldName, file);

    return formData;
  }

  /**
   * Run virtual try-on generation
   * Generates a virtual try-on image combining a person image with clothing
   */
  async runVirtualTryOn(request: TryOnRequest): Promise<WiroRunResponse> {
    try {
      // Create FormData and append both images
      const formData = await this.imageToFormData(
        request.humanImageUri,
        "inputImageHuman"
      );

      // Append clothing image directly to the formData
      const clothesFilename =
        request.clothesImageUri.split("/").pop() || "clothes.jpg";
      const clothesMatch = /\.(\w+)$/.exec(clothesFilename);
      const clothesType = clothesMatch
        ? `image/${clothesMatch[1]}`
        : "image/jpeg";

      const clothesFile = {
        uri: request.clothesImageUri,
        name: clothesFilename,
        type: clothesType,
      } as any;

      formData.append("inputImageClothes", clothesFile);

      // Add try-on specific parameters
      formData.append("style", request.style || DEFAULT_TRYON_CONFIG.style);
      formData.append("pose", request.pose || DEFAULT_TRYON_CONFIG.pose);
      formData.append("plan", request.plan || DEFAULT_TRYON_CONFIG.plan);
      formData.append("callbackUrl", "");

      const headers = generateMultipartHeaders() as any;

      console.log("👔 Starting virtual try-on generation...");
      console.log("Endpoint:", WIRO_ENDPOINTS.VIRTUAL_TRY_ON);

      const response = await this.axiosInstance.post<WiroRunResponse>(
        WIRO_ENDPOINTS.VIRTUAL_TRY_ON,
        formData,
        { headers }
      );

      console.log("✅ Virtual try-on task created:", response.data.taskid);
      return response.data;
    } catch (error) {
      console.error("❌ Virtual try-on error:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Run video generation from image
   * Creates a promotional video using the Sora 2 Pro model
   */
  async runVideoGeneration(
    request: VideoGenerationRequest
  ): Promise<WiroRunResponse> {
    try {
      const formData = await this.imageToFormData(
        request.imageUri,
        "inputImage"
      );
      formData.append("prompt", request.prompt);
      formData.append(
        "seconds",
        request.seconds || DEFAULT_VIDEO_CONFIG.seconds
      );
      formData.append(
        "resolution",
        request.resolution || DEFAULT_VIDEO_CONFIG.resolution
      );
      formData.append("ratio", request.ratio || DEFAULT_VIDEO_CONFIG.ratio);
      formData.append("callbackUrl", "");

      const headers = generateMultipartHeaders() as any;

      console.log("🎬 Starting video generation...");
      console.log("Prompt:", request.prompt);
      console.log("Endpoint:", WIRO_ENDPOINTS.VIDEO_GENERATION);

      const response = await this.axiosInstance.post<WiroRunResponse>(
        WIRO_ENDPOINTS.VIDEO_GENERATION,
        formData,
        { headers }
      );

      console.log("✅ Video task created:", response.data.taskid);
      return response.data;
    } catch (error) {
      console.error("❌ Video generation error:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Run caption generation
   * Generates social media captions using Wiro RAG Chat with image context
   * NOTE: This endpoint uses multipart/form-data and accepts image uploads
   */
  async runCaptionGeneration(
    request: CaptionGenerationRequest
  ): Promise<WiroRunResponse> {
    try {
      // Create FormData with image
      const formData = await this.imageToFormData(
        request.imageUri,
        "inputDocumentMultiple"
      );

      // Add all RAG Chat parameters
      formData.append("selectedModel", DEFAULT_CAPTION_CONFIG.selectedModel);
      formData.append("selectedModelPrivate", "");
      formData.append("inputDocumentUrlMultiple", "");
      formData.append("prompt", request.prompt);
      formData.append("user_id", "");
      formData.append("session_id", "");
      formData.append(
        "system_prompt",
        request.systemPrompt ||
          "You are a social media marketing expert. Create engaging, concise captions with relevant hashtags based on the provided image."
      );
      formData.append(
        "temperature",
        request.temperature || DEFAULT_CAPTION_CONFIG.temperature
      );
      formData.append("top_p", request.topP || DEFAULT_CAPTION_CONFIG.top_p);
      formData.append("top_k", request.topK || DEFAULT_CAPTION_CONFIG.top_k);
      formData.append(
        "chunk_size",
        request.chunkSize || DEFAULT_CAPTION_CONFIG.chunk_size
      );
      formData.append(
        "chunk_overlap",
        request.chunkOverlap || DEFAULT_CAPTION_CONFIG.chunk_overlap
      );
      formData.append(
        "similarity_top_k",
        request.similarityTopK || DEFAULT_CAPTION_CONFIG.similarity_top_k
      );
      formData.append(
        "context_window",
        request.contextWindow || DEFAULT_CAPTION_CONFIG.context_window
      );
      formData.append(
        "max_new_tokens",
        request.maxNewTokens || DEFAULT_CAPTION_CONFIG.max_new_tokens
      );
      formData.append("seed", request.seed || DEFAULT_CAPTION_CONFIG.seed);
      formData.append("quantization", DEFAULT_CAPTION_CONFIG.quantization);
      formData.append("do_sample", DEFAULT_CAPTION_CONFIG.do_sample);
      formData.append("callbackUrl", "");

      const headers = generateMultipartHeaders() as any;

      console.log("✍️ Starting caption generation with RAG Chat...");
      console.log("Image:", request.imageUri);
      console.log("Prompt:", request.prompt);
      console.log("Endpoint:", WIRO_ENDPOINTS.CAPTION_GENERATION);

      const response = await this.axiosInstance.post<WiroRunResponse>(
        WIRO_ENDPOINTS.CAPTION_GENERATION,
        formData,
        { headers }
      );

      console.log("✅ Caption task created:", response.data.taskid);
      return response.data;
    } catch (error) {
      console.error("❌ Caption generation error:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get task status and results
   * Poll this endpoint every 3 seconds to check task progress
   * NOTE: This endpoint requires multipart/form-data, NOT application/json
   */
  async getTaskDetail(
    taskId: string,
    socketAccessToken?: string
  ): Promise<TaskDetailResponse> {
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Use tasktoken (socketAccessToken) if available, otherwise use taskid
      // Per API docs: can use either "tasktoken" or "taskid"
      if (socketAccessToken) {
        formData.append("tasktoken", socketAccessToken);
        console.log(
          `🔍 Polling with tasktoken: ${socketAccessToken.substring(0, 20)}...`
        );
      } else {
        formData.append("taskid", taskId);
        console.log(`🔍 Polling with taskid: ${taskId}`);
      }

      // Use multipart headers (same as other endpoints)
      const headers = generateMultipartHeaders() as any;

      const response = await this.axiosInstance.post<TaskDetailResponse>(
        WIRO_ENDPOINTS.TASK_DETAIL,
        formData,
        { headers }
      );

      // Log full response for debugging
      console.log(
        "📡 Task Detail Response:",
        JSON.stringify(response.data, null, 2)
      );

      // Check for errors in response
      if (response.data.errors && response.data.errors.length > 0) {
        console.error("❌ API Errors:", response.data.errors);
      }

      // Check if tasklist exists and has items
      if (!response.data.tasklist || response.data.tasklist.length === 0) {
        console.warn(
          `⚠️ Task ${taskId} not found in response. Response:`,
          JSON.stringify(response.data)
        );
      }

      const task = response.data.tasklist?.[0];
      if (task) {
        console.log(
          `📊 Task ${taskId} status: ${task.status}`,
          task.status === "task_postprocess_end" ? "✅ COMPLETED" : ""
        );
      } else {
        console.warn(`⚠️ Task ${taskId} not found in response`);
      }

      return response.data;
    } catch (error) {
      console.error("❌ Task detail error:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors and provide user-friendly messages
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        const message =
          error.response.data?.errors?.join(", ") || error.message;
        return new Error(`API Error: ${message}`);
      } else if (error.request) {
        // Request made but no response
        return new Error("Network error: No response from server");
      }
    }
    return error instanceof Error ? error : new Error("Unknown error occurred");
  }
}

// Export singleton instance
export const wiroAPI = new WiroAPI();
export default wiroAPI;
