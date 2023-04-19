/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useEffect, useState } from 'react';
import { Button, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import TableComponent from '@/containers/Table';
import { downloadXL } from '@/utils/xl';
import CBCGenerateModal from '@/containers/CBCGenerateModal';
import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import { useQuery } from '@/hooks/useQuery';
import { compose } from 'lodash/fp';
import { FilterProps, withFilters } from '@/components/Hoc/withFilters/withFilters';
import { PaginationProps, withPagination } from '@/components/Hoc/withPagination/withPagination';
import UploadSerialNumbersModal from '@/containers/UploadSerialNumbersModal';
import { API_ROUTES, USER_ROLES } from '@/utils/constants';
import { v4 as uuid } from 'uuid';
import PaginationComponent from '@/components/Pagination';
import { pickBy } from 'lodash';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import './styles.scss';

const { Option } = Select;

interface CBCData {
  key: string;
  grn_number: string;
  po_number: string;
  status: string;
  grn_date?: string;
}

const CBCGeneratorPage: FC<FilterProps & PaginationProps> = ({
  url,
  setBaseUrl,
  page,
  pageSize,
  onPageChange,
}): JSX.Element => {
  const [poSearch, setPoSearch] = useState('');
  const [statusSeach, setStatucSeach] = useState(null);
  const [grnSearch, setGrnSearch] = useState('');
  const [items, setItems] = useState<CBCData[]>([]);
  const [requestId] = useState<string>(uuid());

  const navigate = useNavigate();

  const { data, retry, loading } = useQuery({
    url,
    page,
    pageSize,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    setBaseUrl(API_ROUTES.PO_GENERATION.GET_POS);
  }, []);

  useEffect(() => {
    if (url) {
      retry();
    }
  }, [url]);

  useEffect(() => {
    // @ts-ignore
    if (data?.content && Array.isArray(data.content)) {
      // @ts-ignore
      const itemsArray = data?.content.map((item: CBCData) => ({
        ...item,
      }));
      setItems(itemsArray);
    }
  }, [data]);

  const columns: ColumnsType<object> = [
    {
      title: 'PO',
      dataIndex: 'po_number',
      key: 'po_number',
      defaultSortOrder: 'descend',
      sorter: (a: any, b: any) => a.po_number.localeCompare(b.po_number),
      // @ts-ignore
      render: (_: string, data: CBCData) => (
        <CBCGenerateModal poOrGrn={_} po={_} grn={data.grn_number} />
      ),
    },
    {
      title: 'GRN',
      dataIndex: 'grn_number',
      key: 'grn_number',
      defaultSortOrder: 'descend',
      sorter: (a: any, b: any) => a.grn_number - b.grn_number,
      // @ts-ignore
      render: (_: string, data: CBCData) => (
        <CBCGenerateModal poOrGrn={_} po={data.po_number} grn={_} />
      ),
    },
    {
      title: 'GRN Date',
      dataIndex: 'grn_date',
      key: 'grn_date',
      defaultSortOrder: 'descend',
      sorter: (a: any, b: any) => a.grn_date?.localeCompare(b.grn_date),
      // @ts-ignore
      render: (_: string) => <div>{moment(new Date(_)).format('YYYY/MM/DD')}</div>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      defaultSortOrder: 'descend',
      sorter: (a: any, b: any) => a.status.localeCompare(b.status),
    },
  ];

  const { data: downloadData, retry: download } = useQuery({
    url: API_ROUTES.PO_GENERATION.GET_POS,
    page: -1,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    // @ts-ignore
    if (downloadData?.content && Array.isArray(downloadData.content)) {
      // @ts-ignore
      const formattedData = downloadData.content?.map((request) => ({
        PO: request.po_number,
        GRN: request.grn_number,
        Status: request.status,
        GRN_Date: moment(new Date(request.grn_date)).format('YYYY/MM/DD'),
      }));
      downloadXL('cbc', formattedData);
    }
  }, [downloadData]);

  const handleDownloadCBCXl = async () => {
    await download();
  };

  const handleSearchClick = (isClear?: boolean) => {
    const baseUrl = '/cbc-generator';

    if (isClear) {
      setGrnSearch('');
      setPoSearch('');
      setStatucSeach(null);
      return navigate(baseUrl);
    }

    const filters = {
      grnNumber: grnSearch,
      poNumber: poSearch,
      status: statusSeach,
    };

    const nonEmptyFilters: any = pickBy(filters, (value) => value && value.length > 0);
    const filtersParams = Object.keys(nonEmptyFilters).map((key) => {
      return `${key}=${encodeURIComponent(nonEmptyFilters[key] || '')}`;
    });
    const url = filtersParams.length > 0 ? `${baseUrl}?${filtersParams.join('&')}` : baseUrl;
    navigate(url);
  };

  const downloadTemplate = async () => {
    const formattedData = [1]?.map(() => ({
      CBC: '',
      'Manufacturer Serial': '',
    }));
    downloadXL('cbc', formattedData);
  };

  const renderTableFilters = () => {
    return (
      <div className='filters'>
        <Input
          placeholder='Search by PO#'
          prefix={<SearchOutlined />}
          value={poSearch}
          onChange={(e) => setPoSearch(e.target.value)}
        />
        <Input
          placeholder='Search by GRN#'
          prefix={<SearchOutlined />}
          value={grnSearch}
          onChange={(e) => setGrnSearch(e.target.value)}
        />
        <div style={{ marginRight: 10 }}>
          <Select
            showSearch={true}
            style={{ width: 200 }}
            value={statusSeach}
            placeholder='Search By Status'
            onChange={(e) => setStatucSeach(e)}
          >
            <Option value={'ASSIGNED'}>ASSIGNED</Option> <Option value={'PENDING'}>PENDING</Option>
          </Select>
        </div>
        <Button className='button' onClick={() => handleSearchClick()}>
          Search
        </Button>
        <Button className='button2' onClick={handleDownloadCBCXl}>
          Download
        </Button>
        <UploadSerialNumbersModal />
        <Button className='button2' onClick={downloadTemplate}>
          Download Template
        </Button>
        {location?.search && (
          <Button className='button5' onClick={() => handleSearchClick(true)}>
            Clear
          </Button>
        )}
      </div>
    );
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    const { pathname, search } = location;
    const url = `${pathname.replace('/', '')}${search}`
      .replace(`?page=${page}&pageSize=${pageSize}`, '')
      .replace(`&page=${page}&pageSize=${pageSize}`, '');
    onPageChange(url, newPage, newPageSize);
  };

  return (
    <div className='CBCGeneratorPage' key={requestId}>
      {renderTableFilters()}
      <div className='cbc-table'>
        <TableComponent columns={columns} data={items} loading={loading} />
        <div className='asset-request-pagination'>
          <PaginationComponent
            defaultCurrent={page}
            // @ts-ignore
            total={data?.totalElements || 0}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

const CBCGeneratorPageWithAuth = withAuth(CBCGeneratorPage, [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.CONFIGURATION_ADMIN,
  USER_ROLES.USER_DEPARTMENT_USER,
  USER_ROLES.USER_DEPARTMENT_MANAGER,
]);

export default compose(withFilters, withPagination)(CBCGeneratorPageWithAuth);
