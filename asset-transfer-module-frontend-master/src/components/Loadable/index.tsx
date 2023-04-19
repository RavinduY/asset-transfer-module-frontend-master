import React, { ExoticComponent, Suspense, SuspenseProps } from 'react';
import { RouteProps } from 'react-router-dom';

const Loadable = (Component: ExoticComponent<SuspenseProps>) => (props: RouteProps) => {
  return (
    <Suspense fallback={<h1>Loading</h1>}>
      <Component {...props} />
    </Suspense>
  );
};
export default Loadable;
