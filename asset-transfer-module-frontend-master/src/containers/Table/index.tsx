import { FC } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Table, TablePaginationConfig } from 'antd';

import './styles.scss';

interface Props {
  data: object[];
  columns: ColumnsType<object>;
  loading?: boolean;
  pagination?: TablePaginationConfig;
  rowSelection?: object;
}

const TableComponent: FC<Props> = ({
  columns,
  data,
  loading,
  pagination,
  rowSelection,
}): JSX.Element => {
  return (
    <div className='Table'>
      <Table
        columns={columns}
        dataSource={data}
        pagination={pagination ? pagination : false}
        loading={loading}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default TableComponent;
