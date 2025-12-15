import { useEffect, useState } from 'react';

type Params = Record<string, string | number | boolean | undefined>;
type Headers = Record<string, string>;
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

function buildUrl(baseUrl: string, params?: Params): string {
  const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
}

function useFetch<T = unknown>(
  baseUrl: string,
  params?: Params,
  headers?: Headers
) {
  const [data, setData] = useState<T | any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fullUrl = buildUrl(baseUrl, params);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('mauzo_token')}`
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl, JSON.stringify(params), JSON.stringify(headers)]); // re-fetch if headers change

  return { data, loading, error };
}

export default useFetch;

