import { API_ROUTES, MOMENT_FORMATS, USER_ROLES } from '@/utils/constants';
import { Button, DatePicker, Input, Select } from 'antd';
import { FC, useEffect, useState } from 'react';
import { PaginationProps, withPagination } from '@/components/Hoc/withPagination/withPagination';

import AssetRequestActionModal from '@/containers/AssetRequestActionModal';
import AssetRequestModal from '@/containers/AssetRequestModal';
import AssetRequestOverviewModal from '@/containers/AssetRequestOverviewModal';
import { Branch } from '@/store/branch';
import { ColumnsType } from 'antd/lib/table';
import ModalComponent from '@/components/Modal';
import PaginationComponent from '@/components/Pagination';
import RequestAssetModal from '@/containers/RequestAssetModal';
import { SearchOutlined } from '@ant-design/icons';
import TableComponent from '@/containers/Table';
import { User } from '@/store/user';
import { compose } from 'lodash/fp';
import moment from 'moment';
import { useQuery } from '@/hooks/useQuery';
import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import { FilterProps, withFilters } from '@/components/Hoc/withFilters/withFilters';
import { useLocation, useNavigate } from 'react-router-dom';
import { groupBy, pickBy } from 'lodash';
import { useAppSelector } from '@/hooks/useRedux';
import { downloadXL } from '@/utils/xl';
import { v4 as uuid } from 'uuid';
import { withAuthorization } from '@/components/Hoc/withAuthorization';

import './styles.scss';

const { Option } = Select;

export interface RequestItem {
  budgeted: boolean;
  categoryName: string;
  costPerUnits: number;
  id: number;
  quantity: number;
}

interface CurrentAction {
  id: number;
  flowType: string;
  name: string;
  role: {
    id: number;
    name: string;
  };
  ifYes: string | null;
  ifNo: string | null;
  ifrequestMore: string | null;
  color: string | null;
}

export interface AssetRequest {
  key: string;
  id: number;
  requestId: string;
  requestItems: RequestItem[];
  budgeted: boolean;
  branchTo: Branch;
  requestBy: string;
  requestDate: string;
  currentAction: CurrentAction;
  user: User;
  createdAt: string;
  assetTransferType?: string;
}

type Props = PaginationProps & FilterProps;

const AssertRequestPage: FC<Props> = ({
  page,
  pageSize,
  onPageChange,
  setBaseUrl,
  url,
}): JSX.Element => {
  const { branches } = useAppSelector((store) => store.branch);
  const { user } = useAppSelector((store) => store.user);

  const [searchText, setSearchText] = useState('');
  const [branchId, setBranch]: any = useState('');
  const [year, setYear] = useState('');
  const [budgetType, setBudgetType] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [statusOverviewOpen, setIsStatusOverviewOpen] = useState<boolean>(false);
  const [assetRequestOpen, setAssetRequestOpen] = useState<boolean>(false);
  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([]);
  const [width, setWidth] = useState(900);
  const [requestId, setRequestId] = useState<string>(uuid());
  const [status, setStatus] = useState<string | null>(null);
  const [statuses, setStatuses]: any = useState([]);

  const { data, loading, meta, retry } = useQuery({
    url,
    page,
    pageSize,
    notFetchOnLoad: true,
  });

  const navigate = useNavigate();

  const { data: actions } = useQuery({
    url: '/asset_request/actions',
  });

  useEffect(() => {
    if (actions && Array.isArray(actions)) {
      const groupedStatus = groupBy(actions, 'name');
      setStatuses(groupedStatus);
    }
  }, [actions]);

  useEffect(() => {
    setBaseUrl(API_ROUTES.ASSET_REQUEST.ALL);
  }, []);

  useEffect(() => {
    if (url) {
      retry();
    }
  }, [url]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setAssetRequests(data?.map((asset, index) => ({ ...asset, key: index })));
    }
  }, [data]);

  const onSelectColumn = (id: string, isRequest?: boolean, other?: boolean) => {
    setSelectedRequestId(id);
    if (other) {
      return;
    }
    if (isRequest) {
      setAssetRequestOpen(true);
      return;
    }
    setIsStatusOverviewOpen(true);
  };
  const columns: ColumnsType<object> = [
    {
      title: 'Request Number',
      dataIndex: 'requestId',
      key: 'requestId',
      render: (_: string, record: object) => {
        const request = record as AssetRequest;
        return <div onClick={() => onSelectColumn(request.requestId, true)}>{_}</div>;
      },
    },
    {
      title: 'Branch Name',
      dataIndex: 'branchName',
      key: 'branchName',
      render: (_: string, record: object) => {
        const request = record as AssetRequest;
        return (
          <div onClick={() => onSelectColumn(request.requestId)}>
            {request?.branchTo?.name || ''}
          </div>
        );
      },
    },
    {
      title: 'Request By',
      dataIndex: 'requestBy',
      key: 'requestBy',
      render: (_: string, record: object) => {
        const request = record as AssetRequest;
        return (
          <div onClick={() => onSelectColumn(request.requestId)}>
            {request?.user?.userName || ''}
          </div>
        );
      },
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      render: (_: string, record: object) => {
        const request = record as AssetRequest;
        return (
          <div onClick={() => onSelectColumn(request.requestId)}>
            {moment(new Date(request.createdAt)).format(MOMENT_FORMATS.YYYY_DD_MM)}
          </div>
        );
      },
    },
    {
      title: 'Budgeted/Unbudgeted',
      dataIndex: 'budgeted',
      key: 'budgeted',
      render: (_: string, record: object) => {
        const request = record as AssetRequest;
        return (
          <div onClick={() => onSelectColumn(request.requestId)}>
            {request?.budgeted ? 'Budgeted' : 'Unbudgeted'}
          </div>
        );
      },
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: string, record: object) => {
        const request = record as AssetRequest;
        return (
          <div onClick={() => onSelectColumn(request.requestId, true, true)}>
            <AssetRequestActionModal
              assetRequest={request}
              element={<>{request?.currentAction?.name}</>}
              id={
                assetRequests.find((assetRequest) => assetRequest.requestId === selectedRequestId)
                  ?.id
              }
              onAfterSubmit={retry}
            />
          </div>
        );
      },
    },
  ];

  const handleSearchClick = (isClear?: boolean) => {
    const baseUrl = '/asset-request';
    if (isClear) {
      setRequestId(uuid());
      setBranch('');
      setYear('');
      setBudgetType('');
      setStatus(null);
      return navigate(baseUrl);
    }

    const filters = {
      requestId: searchText,
      branchId: `${branchId}`,
      budgeted: budgetType,
      actionId: `${status ? statuses[status].map((item: any) => item.id).toString() : '0'}`,
      year,
    };

    const nonEmptyFilters = pickBy(filters, (value) => value && value.length > 0);

    const filtersParams = Object.keys(nonEmptyFilters).map((key) => {
      return `${key}=${encodeURIComponent(nonEmptyFilters[key] || '')}`;
    });
    const url = filtersParams.length > 0 ? `${baseUrl}?${filtersParams.join('&')}` : baseUrl;
    navigate(url);
  };

  const { data: downloadData, retry: download } = useQuery({
    url,
    page: -1,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    if (downloadData && Array.isArray(downloadData)) {
      const formattedData = downloadData?.map((assetRequest: AssetRequest) => ({
        'Request Number': assetRequest?.requestId,
        'Branch Name': assetRequest?.branchTo?.name,
        'Request By': assetRequest?.user?.userName,
        'Budgeted/Unbudgeted': assetRequest?.budgeted ? 'Budgeted' : 'Unbudgeted',
        'Request Date': moment(new Date(assetRequest?.createdAt)).format(MOMENT_FORMATS.YYYY_DD_MM),
        Status: assetRequest.currentAction?.name,
      }));
      downloadXL('asset-request', formattedData);
    }
  }, [downloadData]);

  const renderTableFilters = () => {
    return (
      <div className='filters' key={requestId}>
        <Input
          className='request-input'
          placeholder='Search by Request#'
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          className='branch'
          placeholder='All Branches'
          onChange={(e) => {
            setBranch(branches.find((branch) => branch.name === e)?.id);
          }}
          value={branches.find((br) => br.id === branchId)?.name}
          showSearch={true}
        >
          {branches.map((branch) => (
            <Option key={branch.id} value={branch.name}>
              {branch.name}
            </Option>
          ))}
        </Select>
        <Select
          className='status'
          placeholder='Status'
          onChange={(e) => {
            setStatus(e);
          }}
          value={status}
          showSearch={true}
        >
          {Object.keys(statuses).map((key: any) => (
            <Option key={key} value={key}>
              {key}
            </Option>
          ))}
        </Select>

        <DatePicker
          className='date-picker'
          picker='year'
          bordered={true}
          placeholder='Select Year'
          onChange={(e) => setYear(moment(e).format(MOMENT_FORMATS.YYYY))}
        />
        <Button
          className={budgetType === 'Budgetted' ? 'budgeted button2' : 'normal'}
          onClick={() => setBudgetType('Budgetted')}
        >
          Budgeted
        </Button>
        <Button
          className={budgetType === 'UnBudgetted' ? 'unbudgeted button2' : 'normal'}
          onClick={() => setBudgetType('UnBudgetted')}
        >
          Unbudgeted
        </Button>
        <Button className='search button' onClick={() => handleSearchClick()}>
          Search
        </Button>
        <Button className='download button2' onClick={download}>
          Download
        </Button>
        {withAuthorization(
          <RequestAssetModal onAfterSubmit={retry} />,
          [USER_ROLES.USER_DEPARTMENT_USER, USER_ROLES.BRANCH_USER],
          user?.roles?.map((role) => role.name) || [],
        )}
        {location?.search && (
          <Button className='button5' onClick={() => handleSearchClick(true)}>
            Clear
          </Button>
        )}
      </div>
    );
  };

  const handleOnCancel = () => {
    setSelectedRequestId(null);
    setIsStatusOverviewOpen(false);
  };

  const location = useLocation();

  useEffect(() => {
    if (budgetType) {
      handleSearchClick();
    }
  }, [budgetType]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    const { pathname, search } = location;
    const url = `${pathname.replace('/', '')}${search}`
      .replace(`?page=${page}&pageSize=${pageSize}`, '')
      .replace(`&page=${page}&pageSize=${pageSize}`, '');
    onPageChange(url, newPage, newPageSize);
  };

  return (
    <div className='AssetRequestPage'>
      {renderTableFilters()}
      <div className='asset-request-body'>
        {!!selectedRequestId && !!statusOverviewOpen && (
          <ModalComponent
            visible={statusOverviewOpen}
            onClose={() => setIsStatusOverviewOpen(false)}
            title='Status Overview'
            width={width}
          >
            <AssetRequestOverviewModal
              id={
                assetRequests.find((asserReqtest) => asserReqtest.requestId === selectedRequestId)
                  ?.id || 0
              }
              requestId={selectedRequestId}
              onCancel={handleOnCancel}
              setWidth={setWidth}
            />
          </ModalComponent>
        )}
        {!!selectedRequestId && !!assetRequestOpen && (
          <ModalComponent
            visible={assetRequestOpen}
            onClose={() => setAssetRequestOpen(false)}
            title={`View Asset Request - #${selectedRequestId}`}
            width={800}
          >
            <AssetRequestModal
              onCancel={() => setAssetRequestOpen(false)}
              asset={assetRequests.find(
                (assetRequest) => assetRequest.requestId === selectedRequestId,
              )}
            />
          </ModalComponent>
        )}

        <div className='asset-request'>
          <TableComponent columns={columns} data={assetRequests} loading={loading} />
          <div className='asset-request-pagination'>
            <PaginationComponent
              defaultCurrent={page}
              total={meta?.total || 0}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default compose(withAuth, withFilters, withPagination)(AssertRequestPage);
