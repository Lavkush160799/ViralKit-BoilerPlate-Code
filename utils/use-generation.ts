import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { wiroAPI } from "../services/wiro-api";
import { useContentStore } from "../stores/content-store";
import { ContentItem, ContentType } from "../types";
import { POLLING_CONFIG, PROCESSING_STATUSES, TASK_STATUS } from "./constants";
import {
  extractLatestProgressMessage,
  parseProgressPercentage,
} from "./progress-parser";

/**
 * Hook for running generation tasks and polling for results
 */
export function useGeneration() {
  const { addItem, updateItem } = useContentStore();

  // Create content item helper
  const createContentItem = (
    type: ContentType,
    taskId: string,
    socketAccessToken: string,
    originalImage?: string
  ): ContentItem => ({
    id: `${type}-${Date.now()}`,
    type,
    status: "processing",
    taskId,
    socketAccessToken,
    originalImage,
    outputs: [],
    createdAt: Date.now(),
  });

  // Virtual Try-On Mutation
  const tryOnMutation = useMutation({
    mutationFn: ({
      humanImageUri,
      clothesImageUri,
    }: {
      humanImageUri: string;
      clothesImageUri: string;
    }) => wiroAPI.runVirtualTryOn({ humanImageUri, clothesImageUri }),
    onSuccess: (data, { humanImageUri }) => {
      const item = createContentItem(
        "tryon",
        data.taskid,
        data.socketaccesstoken,
        humanImageUri
      );
      addItem(item);
      Toast.show({
        type: "info",
        text1: "Virtual Try-On Started",
        text2: "Generating virtual try-on image...",
        position: "top",
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Generation Failed",
        text2: error.message,
        position: "top",
      });
    },
  });

  // Video Generation Mutation
  const videoMutation = useMutation({
    mutationFn: ({ imageUri, prompt }: { imageUri: string; prompt: string }) =>
      wiroAPI.runVideoGeneration({ imageUri, prompt }),
    onSuccess: (data, { imageUri }) => {
      const item = createContentItem(
        "video",
        data.taskid,
        data.socketaccesstoken,
        imageUri
      );
      addItem(item);
      Toast.show({
        type: "info",
        text1: "Video Generation Started",
        text2: "Creating your promotional video...",
        position: "top",
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Generation Failed",
        text2: error.message,
        position: "top",
      });
    },
  });

  // Caption Generation Mutation
  const captionMutation = useMutation({
    mutationFn: ({ imageUri, prompt }: { imageUri: string; prompt: string }) =>
      wiroAPI.runCaptionGeneration({ imageUri, prompt }),
    onSuccess: (data, { imageUri }) => {
      const item = createContentItem(
        "caption",
        data.taskid,
        data.socketaccesstoken,
        imageUri
      );
      addItem(item);
      Toast.show({
        type: "info",
        text1: "Caption Generation Started",
        text2: "Analyzing image and writing caption...",
        position: "top",
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Generation Failed",
        text2: error.message,
        position: "top",
      });
    },
  });

  // Recovery function to recheck failed/timeout tasks
  const recoverTask = async (item: ContentItem) => {
    try {
      Toast.show({
        type: "info",
        text1: "Checking Task Status",
        text2: "Rechecking task on server...",
        position: "top",
      });

      const data = await wiroAPI.getTaskDetail(
        item.taskId,
        item.socketAccessToken
      );
      const task = data.tasklist[0];
      if (!task) {
        Toast.show({
          type: "error",
          text1: "Task Not Found",
          text2: "Could not find task on server",
          position: "top",
        });
        return;
      }

      // Parse progress
      const progressPercentage = parseProgressPercentage(task.debugoutput);
      const latestProgressMessage = extractLatestProgressMessage(
        task.debugoutput
      );

      // Update item with latest status
      updateItem(item.id, {
        progressStatus: task.status,
        progressMessage: latestProgressMessage || task.debugoutput,
        progressPercentage: progressPercentage ?? undefined,
        elapsedSeconds: task.elapsedseconds,
      });

      // Check if task completed
      if (task.status === TASK_STATUS.COMPLETED) {
        updateItem(item.id, {
          status: "completed",
          outputs: task.outputs || [],
          caption: task.debugoutput || undefined,
          progressMessage: "Generation complete!",
          error: undefined,
        });

        Toast.show({
          type: "success",
          text1: "Task Completed!",
          text2: "Found completed task on server",
          position: "top",
        });
      } else if (PROCESSING_STATUSES.includes(task.status as any)) {
        // Task is still processing - resume polling
        updateItem(item.id, {
          status: "processing",
          error: undefined,
        });

        Toast.show({
          type: "info",
          text1: "Task Still Processing",
          text2: "Resuming status checks...",
          position: "top",
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Task Status Updated",
          text2: `Current status: ${task.status}`,
          position: "top",
        });
      }
    } catch (error: any) {
      console.error("Recovery error:", error);
      Toast.show({
        type: "error",
        text1: "Recovery Failed",
        text2: error.message || "Could not check task status",
        position: "top",
      });
    }
  };

  return {
    generateTryOn: tryOnMutation.mutate,
    generateVideo: videoMutation.mutate,
    generateCaption: captionMutation.mutate,
    recoverTask,
    isGenerating:
      tryOnMutation.isPending ||
      videoMutation.isPending ||
      captionMutation.isPending,
  };
}

/**
 * Hook for polling a specific task's status
 */
export function useTaskPolling(itemId: string, enabled: boolean = true) {
  const item = useContentStore((state) =>
    state.items.find((i) => i.id === itemId)
  );
  const { updateItem } = useContentStore();
  const attemptsRef = useRef(0);

  const { data, isError } = useQuery({
    queryKey: ["task", item?.taskId],
    queryFn: () => wiroAPI.getTaskDetail(item!.taskId, item!.socketAccessToken),
    enabled:
      enabled &&
      !!item &&
      item.status === "processing" &&
      attemptsRef.current < POLLING_CONFIG.MAX_ATTEMPTS,
    refetchInterval: POLLING_CONFIG.INTERVAL,
    retry: false,
  });

  useEffect(() => {
    if (!data || !item) return;

    attemptsRef.current++;

    const task = data.tasklist[0];
    if (!task) return;

    // Parse progress percentage and latest message
    const progressPercentage = parseProgressPercentage(task.debugoutput);
    const latestProgressMessage = extractLatestProgressMessage(
      task.debugoutput
    );

    // Always update progress information
    updateItem(item.id, {
      progressStatus: task.status,
      progressMessage: latestProgressMessage || task.debugoutput,
      progressPercentage: progressPercentage ?? undefined,
      elapsedSeconds: task.elapsedseconds,
    });

    // Check if task is completed
    if (task.status === TASK_STATUS.COMPLETED) {
      updateItem(item.id, {
        status: "completed",
        outputs: task.outputs || [],
        caption: task.debugoutput || undefined,
        progressStatus: task.status,
        progressMessage: "Generation complete!",
      });

      Toast.show({
        type: "success",
        text1: "Generation Complete!",
        text2: `Your ${item.type} is ready`,
        position: "top",
      });

      attemptsRef.current = 0;
    }
    // Check if task failed
    else if (task.status === TASK_STATUS.CANCELLED) {
      updateItem(item.id, {
        status: "failed",
        error: "Task was cancelled",
        progressStatus: task.status,
        progressMessage: task.debugerror || "Task cancelled",
      });

      Toast.show({
        type: "error",
        text1: "Generation Failed",
        text2: "The task was cancelled",
        position: "top",
      });

      attemptsRef.current = 0;
    }
    // Check for timeout - but only mark as failed if task is truly stuck
    // If task is still in processing status, keep it as processing for recovery
    else if (attemptsRef.current >= POLLING_CONFIG.MAX_ATTEMPTS) {
      // Check if task is still in a processing state (might complete later)
      if (task.status && PROCESSING_STATUSES.includes(task.status as any)) {
        // Task is still processing but we hit timeout - mark for recovery
        updateItem(item.id, {
          status: "failed", // Show as failed but keep taskId for recovery
          error: "Task timed out - but may still be processing",
          progressStatus: task.status,
          progressMessage:
            "Checking timed out. Task may still be processing. Tap 'Check Again' to retry.",
        });

        Toast.show({
          type: "warning",
          text1: "Checking Timed Out",
          text2: "Task may still be processing. You can check again later.",
          position: "top",
        });
      } else {
        // Task seems truly failed
        updateItem(item.id, {
          status: "failed",
          error: "Task timed out",
          progressStatus: "timeout",
          progressMessage: "Task timed out after maximum attempts",
        });

        Toast.show({
          type: "error",
          text1: "Generation Timeout",
          text2: "Task took too long to complete",
          position: "top",
        });
      }
    }
  }, [data, item, updateItem]);

  useEffect(() => {
    if (isError && item) {
      updateItem(item.id, {
        status: "failed",
        error: "Failed to check task status",
      });
    }
  }, [isError, item, updateItem]);

  return {
    isPolling: attemptsRef.current < POLLING_CONFIG.MAX_ATTEMPTS,
    attempts: attemptsRef.current,
  };
}

/**
 * Hook to poll all processing items
 * Uses Zustand subscription to avoid infinite loops
 */
export function useAutoPolling() {
  const activePolls = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const attempts = useRef<Map<string, number>>(new Map());
  const [processingCount, setProcessingCount] = useState(0);

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = useContentStore.subscribe((state) => {
      const processingItems = state.items.filter(
        (item) => item.status === "processing"
      );

      // Update count
      setProcessingCount(processingItems.length);

      // Start polling for new items
      processingItems.forEach((item) => {
        // Skip if already polling this item
        if (activePolls.current.has(item.id)) {
          return;
        }

        console.log("Starting poll for:", item.id);

        // Initialize attempt counter
        attempts.current.set(item.id, 0);

        // Create polling interval
        const interval = setInterval(async () => {
          try {
            const currentAttempts = attempts.current.get(item.id) || 0;

            // Check if max attempts reached
            if (currentAttempts >= POLLING_CONFIG.MAX_ATTEMPTS) {
              const interval = activePolls.current.get(item.id);
              if (interval) {
                clearInterval(interval);
                activePolls.current.delete(item.id);
              }

              // Check if task is still in processing state
              const currentData = await wiroAPI
                .getTaskDetail(item.taskId, item.socketAccessToken)
                .catch(() => null);

              if (
                currentData?.tasklist[0]?.status &&
                PROCESSING_STATUSES.includes(
                  currentData.tasklist[0].status as any
                )
              ) {
                // Task still processing - mark for recovery
                state.updateItem(item.id, {
                  status: "failed",
                  error: "Task timed out - but may still be processing",
                });

                Toast.show({
                  type: "warning",
                  text1: "Checking Timed Out",
                  text2:
                    "Task may still be processing. Use 'Check Again' to retry.",
                  position: "top",
                });
              } else {
                // Task seems truly failed
                state.updateItem(item.id, {
                  status: "failed",
                  error: "Task timed out",
                });

                Toast.show({
                  type: "error",
                  text1: "Generation Timeout",
                  text2: "Task took too long to complete",
                  position: "top",
                });
              }
              return;
            }

            // Poll task status
            const data = await wiroAPI.getTaskDetail(
              item.taskId,
              item.socketAccessToken
            );
            attempts.current.set(item.id, currentAttempts + 1);

            const task = data.tasklist[0];
            if (!task) return;

            // Parse progress percentage and latest message
            const progressPercentage = parseProgressPercentage(
              task.debugoutput
            );
            const latestProgressMessage = extractLatestProgressMessage(
              task.debugoutput
            );

            // Update progress information
            state.updateItem(item.id, {
              progressStatus: task.status,
              progressMessage: latestProgressMessage || task.debugoutput,
              progressPercentage: progressPercentage ?? undefined,
              elapsedSeconds: task.elapsedseconds,
            });

            // Check if task is completed
            if (task.status === TASK_STATUS.COMPLETED) {
              const interval = activePolls.current.get(item.id);
              if (interval) {
                clearInterval(interval);
                activePolls.current.delete(item.id);
              }

              state.updateItem(item.id, {
                status: "completed",
                outputs: task.outputs || [],
                caption: task.debugoutput || undefined,
              });

              Toast.show({
                type: "success",
                text1: "Generation Complete!",
                text2: `Your ${item.type} is ready`,
                position: "top",
              });
            }
            // Check if task failed
            else if (task.status === TASK_STATUS.CANCELLED) {
              const interval = activePolls.current.get(item.id);
              if (interval) {
                clearInterval(interval);
                activePolls.current.delete(item.id);
              }

              state.updateItem(item.id, {
                status: "failed",
                error: "Task was cancelled",
              });

              Toast.show({
                type: "error",
                text1: "Generation Failed",
                text2: "The task was cancelled",
                position: "top",
              });
            }
          } catch (error) {
            console.error("Polling error:", error);
            const interval = activePolls.current.get(item.id);
            if (interval) {
              clearInterval(interval);
              activePolls.current.delete(item.id);
            }

            state.updateItem(item.id, {
              status: "failed",
              error: "Failed to check task status",
            });
          }
        }, POLLING_CONFIG.INTERVAL) as unknown as NodeJS.Timeout;

        activePolls.current.set(item.id, interval);
      });

      // Stop polling for items that are no longer processing
      const processingIds = new Set(processingItems.map((item) => item.id));
      activePolls.current.forEach((interval, itemId) => {
        if (!processingIds.has(itemId)) {
          console.log("Stopping poll for:", itemId);
          clearInterval(interval);
          activePolls.current.delete(itemId);
          attempts.current.delete(itemId);
        }
      });
    });

    // Trigger initial check
    useContentStore.getState();

    // Cleanup function - unsubscribe and clear all intervals
    return () => {
      unsubscribe();
      activePolls.current.forEach((interval) => clearInterval(interval));
      activePolls.current.clear();
    };
  }, []); // Empty deps - only run once on mount

  return {
    processingCount,
  };
}
