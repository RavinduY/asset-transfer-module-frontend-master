import React, { useEffect, useState } from 'react';
import { RouteProps, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export interface PaginationProps {
  pageSize: number;
  page: number;

  onPageChange: (basePath: string, page: number, size: number) => void;
}

export function withPagination<P>(WrappedComponent: React.ComponentType<P>) {
  const PaginationControlled = (props: P & RouteProps) => {
    const [params] = useSearchParams();
    const [page, setPage] = useState<number>(parseInt(params.get('page') || '1'));
    const [pageSize, setPageSize] = useState<number>(parseInt(params.get('pageSize') || '10'));
    const naviagate = useNavigate();

    const location = useLocation();

    const onPageChange = (basePath: string, page: number, pageSize: number) => {
      const symbol = basePath.includes('?') ? '&' : '?';
      naviagate(`/${basePath}${symbol}page=${page}&pageSize=${pageSize}`);
    };

    useEffect(() => {
      const defaultPage = parseInt(params.get('page') || '1');
      const defaultPageSize = parseInt(params.get('pageSize') || '10');
      setPage(defaultPage);
      setPageSize(defaultPageSize);
    }, [location]);

    return (
      <>
        <WrappedComponent {...props} page={page} pageSize={pageSize} onPageChange={onPageChange} />
      </>
    );
  };

  return PaginationControlled;
}
