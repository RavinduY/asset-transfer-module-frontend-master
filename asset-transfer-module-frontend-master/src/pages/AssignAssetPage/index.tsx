/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { compose } from 'lodash/fp';
import { v4 as uuid } from 'uuid';
import { Button, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import TableComponent from '@/containers/Table';
import { downloadXL } from '@/utils/xl';
import AssignAssetModal, { AssetItemDetails } from '@/containers/AssignAssetModal';
import { API_ROUTES, USER_ROLES } from '@/utils/constants';
import { useQuery } from '@/hooks/useQuery';
import PaginationComponent from '@/components/Pagination';
import { PaginationProps, withPagination } from '@/components/Hoc/withPagination/withPagination';
import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import { FilterProps, withFilters } from '@/components/Hoc/withFilters/withFilters';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import moment from 'moment';

const { Option } = Select;

import './styles.scss';
import { withAuthorization } from '@/components/Hoc/withAuthorization';
import DownloadGatePass from '@/components/GatePass/DownloadGatepass';

type Props = PaginationProps & FilterProps;

const AssignAssetPage: FC<Props> = ({
  page,
  pageSize,
  onPageChange,
  url,
  setBaseUrl,
}): JSX.Element => {
  const { user } = useAppSelector((store) => store.user);
  const { branches } = useAppSelector((store) => store.branch);

  const [searchText, setSearchText] = useState('');
  const [assetAssigns, setAssetAssigns] = useState<AssetItemDetails[]>([]);
  const [assignAssetModalShow, setAssignAssetModalShow] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AssetItemDetails>();
  const [id, setId] = useState<string>(uuid());
  const [requestId, setRequestId] = useState<string>(uuid());
  const [branchId, setBranch]: any = useState('');

  const isActionEnabled =
    user?.roles.some((role) => role.name === 'User_Department_User') || user?.department
      ? true
      : false;

  const navigate = useNavigate();

  const { data, loading, meta, retry } = useQuery({
    url,
    page,
    pageSize,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    setBaseUrl(API_ROUTES.ASSIGN_ASSET.ALL);
  }, []);

  useEffect(() => {
    if (url) {
      retry();
    }
  }, [url]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setAssetAssigns(
        data?.map((assign) => ({
          key: `${assign?.id}`,
          id: assign?.id,
          requestNumber: assign?.requestId,
          budgetType: 'Branch',
          requestor: assign?.user?.userName,
          location: `${assign?.user?.branch?.name} Branch`,
          requestedItems: assign?.requestItems,
          ...assign,
        })),
      );
    }
  }, [data]);

  const { data: downloadData, retry: download } = useQuery({
    url,
    page: -1,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    if (downloadData && Array.isArray(downloadData)) {
      const formattedData = downloadData?.map((request) => {
        return {
          'Request Number': request?.requestId,
          'Request Date': moment(new Date(request?.createdAt)).format('DD-MM-YYYY'),
          'Budget Type': 'Branch',
          Requestor: request?.user?.userName,
          Location: `${request?.user?.branch?.name} Branch`,
        };
      });
      downloadXL('Asset Transfer Details', formattedData);
    }
  }, [downloadData]);

  const columns: ColumnsType<object> = [
    {
      title: 'Request Number',
      dataIndex: 'requestNumber',
      key: 'requestNumber',
    },
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_text) => {
        return <div>{moment(new Date(_text)).format('DD-MM-YYYY')}</div>;
      },
    },
    {
      title: 'Budget Type',
      dataIndex: 'budgetType',
      key: 'budgetType',
    },
    {
      title: 'Requestor',
      dataIndex: 'requestor',
      key: 'requestor',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (_text, record: any) => {
        return (
          <div className='action-buttons'>
            {record.currentAction?.id !== 12 && (
              <>
                {withAuthorization(
                  <Button
                    style={{ color: !isActionEnabled ? 'black' : 'white', marginRight: 10 }}
                    className='button3'
                    onClick={() => handleAssignClick(record)}
                    // disabled={!isActionEnabled}
                  >
                    Assign
                  </Button>,
                  [USER_ROLES.USER_DEPARTMENT_USER],
                  user?.roles?.map((role) => role.name) || [],
                )}
              </>
            )}
            {record?.gatePassAvailable && (
              <div>
                <DownloadGatePass
                  onAfterDownload={retry}
                  url={API_ROUTES.GATEPASS.ASSIGN_ASSET?.replace('#{id}', record.id)}
                  visible={true}
                />
              </div>
            )}
            <DownloadGatePass
              isReprint={true}
              url={`/assign_asset/getGatepass/reprint/${record?.id}`}
              onAfterDownload={retry}
              visible={record?.gatePassCount > 0}
              buttonText='Re Print'
            />
          </div>
        );
      },
    },
  ];

  const handleSearchClick = (isClear?: boolean) => {
    if (isClear) {
      setRequestId(uuid());
      setSearchText('');
      return navigate('/assert-transfer/assign');
    }
    navigate(`/assert-transfer/assign?requestId=${searchText}&branchId=${branchId}`);
  };

  const handleAssignClick = (record: any) => {
    const items = data as any;
    setSelectedItem(items?.find((asset: any) => asset?.id === record?.id));
    setAssignAssetModalShow(true);
  };
  const location = useLocation();

  const handlePageChange = (newPage: number, newPageSize: number) => {
    const { pathname, search } = location;
    const url = `${pathname.replace('/', '')}${search}`
      .replace(`?page=${page}&pageSize=${pageSize}`, '')
      .replace(`&page=${page}&pageSize=${pageSize}`, '');
    onPageChange(url, newPage, newPageSize);
  };

  const renderTableFilters = () => {
    return (
      <div className='filters'>
        <Input
          placeholder='Search by Request#'
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          style={{ marginRight: 25 }}
          className='branch'
          placeholder='All Branches'
          showSearch={true}
          onChange={(e) => {
            setBranch(branches.find((branch) => branch.name === e)?.id);
          }}
          value={branches.find((br) => br.id === branchId)?.name}
        >
          {branches.map((branch) => (
            <Option key={branch.id} value={branch.name}>
              {branch.name}
            </Option>
          ))}
        </Select>
        <Button className='button' onClick={() => handleSearchClick()}>
          Search
        </Button>
        <Button className='button2' onClick={download}>
          Download
        </Button>
        {location?.search && (
          <Button className='button5' onClick={() => handleSearchClick(true)}>
            Clear
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className='AssignAssetPage' key={requestId}>
      {renderTableFilters()}
      <div className='asset-asign-table'>
        <TableComponent columns={columns} data={assetAssigns} loading={loading} />
      </div>
      <div className='pagination'>
        <PaginationComponent
          defaultCurrent={page}
          total={meta?.total || 0}
          onPageChange={handlePageChange}
        />
      </div>
      <AssignAssetModal
        key={id}
        show={assignAssetModalShow}
        close={() => {
          setAssignAssetModalShow(false);
          setId(uuid());
        }}
        assetData={selectedItem as any}
        onAfterSubmit={retry}
      />
    </div>
  );
};

const AssignAssetPageWithAuth = withAuth(AssignAssetPage, [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.USER_DEPARTMENT_USER,
  USER_ROLES.USER_ADMIN,
  USER_ROLES.CONFIGURATION_ADMIN,
]);

export default compose(withPagination, withFilters)(AssignAssetPageWithAuth);
