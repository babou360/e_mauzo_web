import useErrorStore from '@/store/atoms/error';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

interface Props {
  method: string;
  url: string;
  params?: Record<string, any>;
  body?: Record<string, any>;
}

function useSendMultipartRequest<T>({ url, params, body, method }: Props) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const { error, setError, clearError } = useErrorStore();

  // Helper: detect if any field in body contains File(s)
  const hasFileObject = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    for (const key in obj) {
      const value = obj[key];
      if (value instanceof File) return true;
      if (Array.isArray(value) && value.some((v) => v instanceof File)) return true;
    }
    return false;
  };

  const sendRequest = async () => {
    setLoading(true);
    try {
      let dataToSend: any = body;
      let headers: Record<string, string> = {
        Authorization: `Bearer ${localStorage.getItem('mauzo_token') || ''}`,
      };

      // 🔍 Detect if body contains files → convert to FormData
      if (hasFileObject(body)) {
        const formData = new FormData();
        for (const key in body) {
          const value = body[key];
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
          } else {
            formData.append(key, value);
          }
        }
        dataToSend = formData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        headers['Content-Type'] = 'application/json';
      }

      const response = await axios.request({
        method,
        url,
        data: dataToSend,
        params,
        headers,
      });

      setData(response.data);

      // ✅ Save token on login/register
      if (
        url === `${process.env.NEXT_PUBLIC_HOST}/users/login` ||
        url === `${process.env.NEXT_PUBLIC_HOST}/users/register`
      ) {
        localStorage.setItem('mauzo_token', response.data.token);
        localStorage.setItem('user_status', response.data.status);
      }

      location.reload();
    } catch (err: any) {
      console.log(err)
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'An unexpected error occurred';
      setError({ type: 'error', message });
      setTimeout(() => clearError(), 3000);
    } finally {
      setTimeout(() => setLoading(false), 4000);
    }
  };

  useEffect(() => {}, [body, params, url, method]);

  return { data, loading, error, sendRequest };
}

export default useSendMultipartRequest;
