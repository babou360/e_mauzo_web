import useErrorStore from '@/store/atoms/error';
import errorState from '@/store/atoms/error';
import axios, { AxiosError } from 'axios';
import { METHODS } from 'http';
import { useEffect, useState } from 'react';

interface Props {
  method: string,
  url: string;
  params?: Record<string, any>; 
  body?: Record<string, any>;
}

function useSendRequest<T>({ url, params, body,method }: Props) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const { error, setError, clearError } = useErrorStore()

  const sendRequest = async () => {
    setLoading(true);
    try {
      axios.request({
        method: method,
        url: url,
        data: body,
        params: params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('mauzo_token')}`
        }
      }).then((data)=> {
        console.log(data)
        if (url.includes('/users/login') || url.includes('/users/register')){
          localStorage.setItem("mauzo_token",data.data.token)
          localStorage.setItem("user_status",data.data.status)
          localStorage.setItem("bazenga_token",data.data.token)
        }
        setTimeout(() => {
          location.reload();
        }, 4000);
      }).catch((error)=> {
        setError({type:"error",message: error.response.data.error})
        setTimeout(()=> {
          clearError()
        },3000)
      }).finally(()=> {
        setTimeout(()=> {
          setLoading(false)
        },4000)
      })
    } catch (err:any) {
      setError({type:"error",message: error.response.data.error})
      setTimeout(()=> {
          clearError()
        },3000)
    } finally {
      setTimeout(()=> {
          setLoading(false)
        },4000)
    }
  };

  useEffect(() => {
    
  }, [body,params,url,method]);

  return { data, loading, error, sendRequest };
}

export default useSendRequest;