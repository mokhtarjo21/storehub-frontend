import { useState, useEffect } from 'react';
import { apiRequest, handleApiResponse } from '../utils/api';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useApi = (url: string, options: UseApiOptions = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { immediate = true, onSuccess, onError } = options;

  const execute = async (requestOptions?: RequestInit) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest(url, requestOptions);
      const result = await handleApiResponse(response);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('API request failed');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [url, immediate]);

  return { data, loading, error, execute };
};

export const useApiMutation = (url: string, options: UseApiOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { onSuccess, onError } = options;

  const mutate = async (requestOptions?: RequestInit) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest(url, requestOptions);
      const result = await handleApiResponse(response);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('API request failed');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};