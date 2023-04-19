import { FC } from 'react';
import { Pagination } from 'antd';

interface Props {
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  defaultCurrent: number;
  showSizeChanger?: boolean;
}

const PaginationComponent: FC<Props> = ({
  defaultCurrent,
  onPageChange,
  total,
  showSizeChanger,
}): JSX.Element => {
  return (
    <Pagination
      current={defaultCurrent}
      total={total}
      onChange={onPageChange}
      showSizeChanger={!!showSizeChanger}
    />
  );
};

export default PaginationComponent;
