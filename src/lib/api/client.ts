import type { AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/** Response interceptor: transform errors into consistent format */
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<never> => {
    const serverError = error.response?.data as {
      error?: { code?: string; message?: string };
    };
    const message =
      serverError?.error?.message ?? 'An unexpected error occurred';
    const transformed = new Error(message);
    (transformed as Error & { code?: string }).code =
      serverError?.error?.code;
    return Promise.reject(transformed);
  },
);

export default apiClient;
