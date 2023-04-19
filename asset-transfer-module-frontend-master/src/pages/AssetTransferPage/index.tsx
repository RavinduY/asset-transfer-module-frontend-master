/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Input } from 'antd';
import { FC, useEffect, useState } from 'react';
import { PaginationProps, withPagination } from '@/components/Hoc/withPagination/withPagination';
import { API_ROUTES, USER_ROLES } from '@/utils/constants';
import ActionModal from '@/containers/ActionModal';
import type { ColumnsType } from 'antd/es/table';
import PaginationComponent from '@/components/Pagination';
import { SearchOutlined } from '@ant-design/icons';
import TableComponent from '@/containers/Table';
import TransferRequestModal from '@/containers/TransferRequestModal';
import ViewAssetTransferModal from '@/containers/ViewAssetTransferModal';
import { compose } from 'lodash/fp';
import { useQuery } from '@/hooks/useQuery';
import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import RequestOverviewModal from '@/containers/RequestOverviewModal';
import { FilterProps, withFilters } from '@/components/Hoc/withFilters/withFilters';
import { useLocation, useNavigate } from 'react-router-dom';
import { downloadXL } from '@/utils/xl';
import { v4 as uuid } from 'uuid';
import { withAuthorization } from '@/components/Hoc/withAuthorization';
import { useAppSelector } from '@/hooks/useRedux';
import moment from 'moment';
import DownloadGatePass from '@/components/GatePass/DownloadGatepass';

import './styles.scss';

interface TransferItemDetails {
  key: string;
  requestNumber: string;
  type: string;
  fromLocation: string;
  toLocation: string;
  status: string;
  id: number;
}

type Props = PaginationProps & FilterProps;

interface TransferRequests {
  requestNumber: string;
  type: string;
  fromLocation: string;
  toLocation: string;
  status: string;
  id: number;
}

const AssetTransferPage: FC<Props> = ({
  page,
  pageSize,
  onPageChange,
  setBaseUrl,
  url,
}): JSX.Element => {
  const { user } = useAppSelector((store) => store.user);

  const [searchText, setSearchText] = useState('');
  const [transferRequests, setTransferRequests] = useState<TransferRequests[]>([]);
  const [fromLocation]: any = useState('');
  const [toLocation]: any = useState('');

  const [selectedRequest, setSelectedRequest] = useState<number>(0);
  const [requestId, setRequestId] = useState<string>(uuid());

  const navigate = useNavigate();

  useEffect(() => {
    setBaseUrl(API_ROUTES.ASSET_TRANSFER.ASSET_TRANSFER_REQUEST);
  }, []);

  const handleSearchClick = (isClear?: boolean) => {
    if (isClear) {
      setRequestId(uuid());
      setSearchText('');
      fromLocation('');
      toLocation('');
      return navigate('/assert-transfer/transfer');
    }

    navigate(`/assert-transfer/transfer?requestId=${searchText}`);
  };

  const { data: downloadData, retry: download } = useQuery({
    url,
    page: -1,
    notFetchOnLoad: true,
  });

  const { data, meta, retry, loading } = useQuery({
    url,
    page,
    pageSize,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    if (downloadData && Array.isArray(downloadData)) {
      const formattedData = downloadData?.map((request) => ({
        'Request Number': request?.requestId,
        Type: request?.assetTransferType,
        'From Location': request?.branchFrom?.name,
        'To Location': request?.branchTo?.name || request?.departmentTo?.name,
        Status: request?.currentAction?.name,
      }));
      downloadXL('Asset Transfer Details', formattedData);
    }
  }, [downloadData]);

  useEffect(() => {
    if (url) {
      retry();
    }
  }, [url]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setTransferRequests(
        data?.map((request) => ({
          fromLocation: request?.branchFrom?.name || request?.departmentFrom?.name,
          requestNumber: request?.requestId,
          status: request?.currentAction?.name,
          toLocation: request?.branchTo?.name || request?.departmentTo?.name,
          type: request?.assetTransferType,
          id: request.id,
          key: request.id,
          ...request,
        })),
      );
    }
  }, [data]);

  const columns: ColumnsType<object> = [
    {
      title: 'Request Number',
      dataIndex: 'requestNumber',
      key: 'requestNumber',
      render: (_: string, row: object) => {
        const record = row as TransferItemDetails;
        return (
          <RequestOverviewModal
            title={_}
            id={record.id}
            url={API_ROUTES.TRANSFER.STATUS?.replace('#{id}', `${record.id}`)}
          />
        );
      },
    },
    {
      title: 'Request Date',
      dataIndex: 'request_date',
      key: 'request_date',
      render: (_: string, row: object) => {
        // @ts-ignore
        return <div>{moment(new Date(row?.createdAt)).format('DD-MM-YYYY')}</div>;
      },
    },
    {
      title: 'Requestor',
      dataIndex: 'requestor',
      key: 'requestor',
      render: (_: string, row: object) => {
        // @ts-ignore
        return <div>{row?.user?.userName}</div>;
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (_: string, row: object) => {
        const record = row as TransferItemDetails;
        return <div onClick={() => setSelectedRequest(record.id)}>{_}</div>;
      },
    },
    {
      title: 'From Location',
      dataIndex: 'fromLocation',
      key: 'fromLocation',
      render: (_: string, row: object) => {
        const record = row as TransferItemDetails;
        return <div onClick={() => setSelectedRequest(record.id)}>{_}</div>;
      },
    },
    {
      title: 'To Location',
      dataIndex: 'toLocation',
      key: 'toLocation',
      render: (_: string, row: object) => {
        const record = row as TransferItemDetails;
        return <div onClick={() => setSelectedRequest(record.id)}>{_}</div>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: string, row: object) => {
        const allData: any = data;
        const record = row as TransferItemDetails;
        const selected = allData?.find((data: any) => data?.id === record?.id);
        return (
          <ActionModal
            color={selected?.currentAction?.color}
            status={selected?.currentAction?.name}
            onAfterSubmit={() => {
              // this is needed
            }}
            data={allData?.find((data: any) => data?.id === record?.id)}
            id={record.id}
            items={selected?.requestItems?.map((item: any) => {
              return {
                id: item?.id,
                categoryName: item?.categoryName,
                cbcs: item?.items?.map((it: any) => it?.cbc),
                color: item?.color,
                costPerUnits: item?.costPerUnits,
              };
            })}
            title={`${selected?.assetTransferType} Transfer - #${selected?.requestId}`}
            url={API_ROUTES.TRANSFER.SAVE_TRANSFER}
          />
        );
      },
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (_: string, row: any) => {
        return (
          <div>
            <DownloadGatePass
              url={API_ROUTES.GATEPASS.ASSET_TRANSFER.replace('#{id}', row?.id)}
              visible={row?.gatePassAvailable}
              onAfterDownload={retry}
              key={`${row?.id}_0`}
            />
            <DownloadGatePass
              isReprint={true}
              url={`/asset-transfer-req/getGatepass/reprint/${row?.id}`}
              visible={row?.gatePassCount > 0}
              onAfterDownload={retry}
              buttonText='Re Print'
              key={`${row?.id}_1`}
            />
          </div>
        );
      },
    },
  ];

  const renderTableFilters = () => {
    return (
      <div className='filters'>
        <Input
          placeholder='Search by Request#'
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button className='button' onClick={() => handleSearchClick()}>
          Search
        </Button>
        <Button className='button2' onClick={download}>
          Download
        </Button>

        {withAuthorization(
          <TransferRequestModal onAfterSubmit={retry} />,
          [USER_ROLES.SUPER_ADMIN, USER_ROLES.USER_DEPARTMENT_USER],
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
  const location = useLocation();

  const handlePageChange = (newPage: number, newPageSize: number) => {
    const { pathname, search } = location;
    const url = `${pathname.replace('/', '')}${search}`
      .replace(`?page=${page}&pageSize=${pageSize}`, '')
      .replace(`&page=${page}&pageSize=${pageSize}`, '');
    onPageChange(url, newPage, newPageSize);
  };

  const selectedRequestDetails = () => {
    const requests: any = data;
    const request = requests?.find((req: any) => req.id === selectedRequest);
    const items: any = [];
    request?.requestItems?.forEach((requestItem: any) => {
      items.push({
        name: requestItem?.categoryName,
        requestedAmount: requestItem?.items?.length || 0,
        selectedCbcNumbers: requestItem?.items?.map((item: any) => item?.cbc),
      });
    });

    return {
      fromLocation: request?.branchFrom?.name || request?.departmentFrom?.name,
      requestNumber: request?.requestId,
      toLocation: request?.branchTo?.name || request?.departmentTo?.name,
      type: request?.assetTransferType,
      budgetType: request?.budgetType?.name,
      setVisible: () => setSelectedRequest(0),
      items: items || [],
      floor: request?.floor?.name,
      building: request?.building?.name,
    };
  };

  return (
    <div className='AssetTransferPage' key={requestId}>
      {renderTableFilters()}
      {selectedRequest !== 0 && <ViewAssetTransferModal {...selectedRequestDetails()} />}
      <div className='asset-transfer-table'>
        <TableComponent columns={columns} data={transferRequests} loading={loading} />
      </div>
      <div className='pagination'>
        <PaginationComponent
          defaultCurrent={page}
          total={meta?.total || 0}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default compose(withPagination, withFilters, withAuth)(AssetTransferPage);
