import React, { useEffect, useState } from 'react';
import { RouteProps, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';

export function withAuth<P>(WrappedComponent: React.ComponentType<P>, roles?: string[]) {
  const VisibityControlled = (props: P & RouteProps) => {
    const { authenticated, user } = useAppSelector((store) => store.user);
    const naviagate = useNavigate();
    const [permission, setPermission] = useState(false);

    useEffect(() => {
      checkPermission();
    }, [authenticated]);

    const checkPermission = () => {
      if (authenticated === false) {
        naviagate('/login');
        return;
      }
      if (authenticated === true) {
        if (!roles || roles.length === 0) {
          setPermission(true);
          return;
        }
        const userRoles = user?.roles.map((role) => role.name) || [];
        const authorized = roles?.some((item) => userRoles.includes(item));

        if (authorized) {
          setPermission(true);
          return;
        }
        naviagate('/');
        return;
      }
    };

    return (
      <div>
        {permission ? (
          <WrappedComponent {...props} />
        ) : (
          <div className='h-screen flex'>
            <div className='m-auto'>loading</div>
          </div>
        )}
      </div>
    );
  };

  return VisibityControlled;
}
