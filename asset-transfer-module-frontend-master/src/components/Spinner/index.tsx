import { FC } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import './styles.scss';

interface Props {
  size?: number;
}

const Spinner: FC<Props> = ({ size }): JSX.Element => {
  return (
    <div className='Spinner'>
      <Spin indicator={<LoadingOutlined style={{ fontSize: size || 24 }} spin />} />
    </div>
  );
};

export default Spinner;
