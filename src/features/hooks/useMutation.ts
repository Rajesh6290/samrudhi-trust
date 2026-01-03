"use client";
import axios, { AxiosProgressEvent, AxiosRequestConfig } from "axios";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
type MutationOptions = {
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  isFormData?: boolean;
  BASE_URL?: string;
  body?: unknown;
  isAlert?: boolean;
  onProgress?: (progress: number) => void;
  type?: string;
};
const useMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pendingRequestsRef = useRef<Map<string, boolean>>(new Map());

  const mutation = useCallback(
    async (path: string, options?: MutationOptions) => {
      const requestKey = `${path}-${JSON.stringify(options?.body)}`;
      if (pendingRequestsRef.current.get(requestKey)) {
        return;
      }
      pendingRequestsRef.current.set(requestKey, true);
      setIsLoading(true);

      try {
        const method = options?.method || "POST";
        const body = options?.isFormData
          ? options.body
          : JSON.stringify(options?.body);
        const headers: Record<string, string> = options?.isFormData
          ? { credentials: "include" }
          : { "Content-Type": "application/json", credentials: "include" };

        if (options?.type) headers["Type"] = options.type;

        const config: AxiosRequestConfig = {
          url: `/api/${path}`,
          method,
          headers,
          data: body,
          timeout: 0,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (options?.onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              options.onProgress(progress);
            }
          },
        };

        const response = await axios(config);
        const results = response.data;
        const status = response.status;

        if (options?.isAlert) {
          if (results?.success) {
            toast.success(results?.message);
          } else {
            toast.error(results?.error?.message);
          }
        }

        return { results, status };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (options?.isAlert) {
            toast.error(
              error.response?.data?.message ||
                error.response?.data?.error ||
                "Something went wrong !!"
            );
          }
          return {
            results: error.response?.data,
            status: error.response?.status || 500,
          };
        } else {
          if (options?.isAlert) {
            toast.error("Something went wrong");
          }
          return {
            results: { error: "Something went wrong" },
            status: 500,
          };
        }
      } finally {
        // Clear this request from pending
        pendingRequestsRef.current.delete(requestKey);
        setIsLoading(false);
      }
    },
    []
  );

  return { mutation, isLoading };
};

export default useMutation;
