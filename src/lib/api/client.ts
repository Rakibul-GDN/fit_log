import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/** Request interceptor: attach auth token if available */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Token will be injected once NextAuth session integration is wired
    return config;
  },
  (error: AxiosError): Promise<never> => Promise.reject(error),
);

/** Response interceptor: unwrap envelope, transform errors */
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
