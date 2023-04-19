import { FC, ReactNode } from 'react';
import { Result } from 'antd';
import { ResultStatusType } from 'antd/lib/result';

interface Props {
  status?: ResultStatusType;
  title: string;
  subTitle?: string;
  extra?: ReactNode;
}

const ResultsComponent: FC<Props> = ({ status, title, subTitle, extra }) => {
  return <Result status={status} title={title} subTitle={subTitle} extra={extra} />;
};

export default ResultsComponent;
