import React, { useEffect, useState } from 'react';
import { RouteProps, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import Spinner from '@/components/Spinner';

export function withUnAuth<P>(WrappedComponent: React.ComponentType<P>) {
  const VisibityControlled = (props: P & RouteProps) => {
    const { authenticated } = useAppSelector((store) => store.user);
    const naviagate = useNavigate();
    const [permission, setPermission] = useState(false);

    useEffect(() => {
      checkPermission();
    }, [authenticated]);

    const checkPermission = () => {
      if (authenticated === true) {
        naviagate('/');
        return;
      }
      if (authenticated === false) {
        setPermission(true);
      }
    };

    return (
      <div>
        {permission ? (
          <WrappedComponent {...props} />
        ) : (
          <div className='h-screen flex'>
            <div className='m-auto'>
              <Spinner />
            </div>
          </div>
        )}
      </div>
    );
  };

  return VisibityControlled;
}
