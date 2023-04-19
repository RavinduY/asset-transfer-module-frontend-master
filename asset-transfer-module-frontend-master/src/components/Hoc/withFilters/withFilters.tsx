import React, { useEffect, useState } from 'react';
import { RouteProps, useLocation, useNavigate } from 'react-router-dom';
import { pickBy } from 'lodash';

export interface FilterProps {
  url: string;

  setBaseUrl: (baseUrl: string) => void;
}

export interface Filters {
  [field: string]: string | undefined;
}

export function withFilters<P>(WrappedComponent: React.ComponentType<P>) {
  const FilterControlled = (props: P & RouteProps) => {
    const [url, setUrl] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      generateUrl();
    }, [location, baseUrl]);

    const generateUrl = () => {
      if (baseUrl) {
        const params = new URLSearchParams(location.search);
        const filters: Filters = {};
        for (const [key, value] of params.entries()) {
          filters[key] = value;
        }
        const nonEmptyFilters = pickBy(filters, (value) => value && value.length > 0);

        const filtersParams = Object.keys(nonEmptyFilters).map((key) => {
          return `${key}=${encodeURIComponent(nonEmptyFilters[key] || '')}`;
        });
        if (Object.keys(nonEmptyFilters).length === Object.keys(filters).length) {
          setUrl(filtersParams.length > 0 ? `${baseUrl}?${filtersParams.join('&')}` : baseUrl);
          return;
        }
        const { pathname } = location;
        return navigate(`${pathname}?${filtersParams.join('&')}`);
      }
    };

    return (
      <>
        <WrappedComponent {...props} generateUrl={generateUrl} url={url} setBaseUrl={setBaseUrl} />
      </>
    );
  };

  return FilterControlled;
}
