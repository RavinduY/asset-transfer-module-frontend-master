import React, { FC } from 'react';
import Navbar from '@/components/Navbar';
import SideBar from '@/components/Sidebar';

import './styles.scss';
interface Props {
  children: React.ReactNode;
}

const AppLayout: FC<Props> = ({ children }) => {
  return (
    <div className='AppLayout'>
      <div className='body'>
        <div className='sidebar'>
          <SideBar />
        </div>
        <div className='content'>
          <Navbar />
          <div className='main-body'>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
