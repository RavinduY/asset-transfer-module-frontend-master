/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { message } from 'antd';
import { HTTP_TYPES, MESSAGES } from '@/utils/constants';
import http from '@/services/http';

interface IProps {
  url: string;
}

const useMutation = ({ url }: IProps) => {
  const [loading, setLoading] = useState(false);

  const mutate = async (
    body: object,
    method?: HTTP_TYPES,
    customHeaders?: object,
    requestUrl?: string,
  ) => {
    setLoading(true);

    const headers = {
      headers: {
        ...customHeaders,
      },
    };
    try {
      const response = await http[method || HTTP_TYPES.POST](requestUrl || url, body, headers);
      setLoading(false);
      return {
        success: true,
        data: response?.data,
        errors: null,
      };
    } catch (err: any) {
      setLoading(false);
      if (err.status === 403) {
        message.error(MESSAGES.COMMON.ERRORS.PERMISSION);
      }
      return {
        success: false,
        data: null,
        errors: err,
      };
    }
  };

  return { loading, mutate };
};

export { useMutation };
