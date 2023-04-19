/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Input } from 'antd';
import { FC, useEffect, useState } from 'react';
import { PaginationProps, withPagination } from '@/components/Hoc/withPagination/withPagination';

import { API_ROUTES, USER_ROLES } from '@/utils/constants';
import ActionModal from '@/containers/ActionModal';
import { ColumnsType } from 'antd/lib/table';
import InterDepartmentTransferModal from '@/containers/InterDepartmentTransferModal';
import PaginationComponent from '@/components/Pagination';
import { SearchOutlined } from '@ant-design/icons';
import TableComponent from '@/containers/Table';
import { compose } from 'lodash/fp';
import { useQuery } from '@/hooks/useQuery';
import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import RequestOverviewModal from '@/containers/RequestOverviewModal';
import { useNavigate } from 'react-router-dom';
import { FilterProps, withFilters } from '@/components/Hoc/withFilters/withFilters';
import { downloadXL } from '@/utils/xl';
import { useAppSelector } from '@/hooks/useRedux';
import { v4 as uuid } from 'uuid';
import { withAuthorization } from '@/components/Hoc/withAuthorization';
import DownloadGatePass from '@/components/GatePass/DownloadGatepass';

import './styles.scss';
import ViewMiniStockModal from '@/containers/ViewMiniStockModal';

interface InterDepartmentTransferRequest {
  key: number;
  id: number;
  requestNumber: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  status: string;
}

type Props = PaginationProps & FilterProps;

const InterDepartmentTransferPage: FC<Props> = ({
  page,
  onPageChange,
  pageSize,
  setBaseUrl,
  url,
}): JSX.Element => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [requests, setRequests] = useState<InterDepartmentTransferRequest[]>([]);
  const [requestId, setRequestId] = useState<string>(uuid());
  const [selectedRequest, setSelectedRequest] = useState<number>(0);

  const { user } = useAppSelector((store) => store.user);

  const isRequestEnable =
    user?.roles.some((role) => role.name === 'Super_Admin') || user?.department ? true : false;

  useEffect(() => {
    setBaseUrl(API_ROUTES.ASSET_TRANSFER.INTER_DEPARTMENT_TRANSFER);
  }, []);

  const { data, loading, meta, retry } = useQuery({
    url,
    page,
    pageSize,
    notFetchOnLoad: true,
  });

  const { data: downloadData, retry: download } = useQuery({
    url,
    page: -1,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    if (downloadData && Array.isArray(downloadData)) {
      const formattedData = downloadData?.map((request) => ({
        'Request Number': request.interRequestId,
        'From Location': request.fromDepartmentName,
        'To Location': request.toDepartmentName,
        Quantity: request.quantity,
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
      setRequests(
        data?.map((request) => ({
          key: request.id,
          id: request.id,
          requestNumber: request.interRequestId,
          fromLocation: 'Head Office.Warehouse',
          toLocation: request.toDepartmentName,
          quantity: request.quantity,
          status: request.status,
          ...request,
        })),
      );
    }
  }, [data]);

  const selectedRequestDetails = () => {
    const requests: any = data;
    console.log(requests?.find((req: any) => req.id === selectedRequest));
    const request = requests?.find((req: any) => req.id === selectedRequest);
    const items: any = [];
    request?.selectedData?.forEach((requestItem: any) => {
      items.push({
        name: requestItem?.categoryName,
        requestedAmount: requestItem?.cbcs?.length || 0,
        selectedCbcNumbers: requestItem?.cbcs?.map((item: any) => item?.cbc),
      });
    });

    return {
      fromLocation: request?.fromDepartmentName,
      requestNumber: request?.interRequestId,
      toLocation: request?.toDepartmentName,
      type: request?.assetTransferType,
      budgetType: request?.budgetType?.name,
      setVisible: () => setSelectedRequest(0),
      items: items || [],
      floor: request?.floor?.name,
      building: request?.building?.name,
    };
  };

  const columns: ColumnsType<object> = [
    {
      title: 'Request Number',
      dataIndex: 'requestNumber',
      key: 'requestNumber',
      render: (_: string, row: object) => {
        const record = row as InterDepartmentTransferRequest;
        return (
          <RequestOverviewModal
            title={_}
            id={record.id}
            url={API_ROUTES.ASSET_TRANSFER.INTER_DEPARTMENT_TRANSFER_STATUS?.replace(
              '#{id}',
              `${record.id}`,
            )}
          />
        );
      },
    },
    {
      title: 'From Location',
      dataIndex: 'fromLocation',
      key: 'fromLocation',
      render: (_: string, row: object) => {
        const record = row as InterDepartmentTransferRequest;
        return <div onClick={() => setSelectedRequest(record.id)}>{_}</div>;
      },
    },
    {
      title: 'To Location',
      dataIndex: 'toLocation',
      key: 'toLocation',
      render: (_: string, row: object) => {
        const record = row as InterDepartmentTransferRequest;
        return <div onClick={() => setSelectedRequest(record.id)}>{_}</div>;
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: string, row: object) => {
        const allData: any = data;
        const record = row as any;
        const selected = allData?.find((data: any) => data?.id === record?.id);
        return (
          <ActionModal
            status={selected?.currentAction?.name}
            color={selected?.currentAction?.color}
            onAfterSubmit={retry}
            data={allData?.find((data: any) => data?.id === record?.id)}
            id={record.id}
            items={selected?.selectedData || []}
            title={`Mini Stock Transfer - #${selected?.interRequestId}`}
            url={API_ROUTES.ASSET_TRANSFER.INTER_DEPARTMENT_TRANSFER_NEW_STATUS}
          />
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_: string, row: any) => (
        <div>
          <DownloadGatePass
            url={API_ROUTES.GATEPASS.INTER_DEPARTMENT?.replace('#{id}', row.id)}
            visible={row?.gatePassAvailable}
            onAfterDownload={retry}
            key={`${row?.id}_0`}
          />
          <DownloadGatePass
            isReprint={true}
            url={`/interTranferReqest/getGatepass/reprint/${row?.id}`}
            visible={row?.gatePassCount > 0}
            onAfterDownload={retry}
            buttonText='Re Print'
            key={`${row?.id}_1`}
          />
        </div>
      ),
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
        <Button className='button2' onClick={handleDownloadClick}>
          Download
        </Button>
        {isRequestEnable &&
          withAuthorization(
            <InterDepartmentTransferModal onAfterSubmit={retry} />,
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

  const handleSearchClick = (isClear?: boolean) => {
    if (isClear) {
      setRequestId(uuid());
      setSearchText('');
      return navigate('/assert-transfer/inter-department');
    }

    navigate(`/assert-transfer/inter-department?requestId=${searchText}`);
  };

  const handleDownloadClick = async () => {
    await download();
  };

  const handleOnPageChange = (page: number, size: number) => {
    onPageChange('assert-transfer/inter-department', page, size);
  };

  return (
    <div className='InterDepartmentTransferPage' key={requestId}>
      {selectedRequest !== 0 && <ViewMiniStockModal {...selectedRequestDetails()} />}
      {renderTableFilters()}
      <div className='inter-department-transfer-table'>
        <TableComponent columns={columns} data={requests} loading={loading} />
      </div>
      <div className='pagination'>
        <PaginationComponent
          onPageChange={handleOnPageChange}
          total={meta?.total || 0}
          defaultCurrent={page}
        />
      </div>
    </div>
  );
};

export default compose(withAuth, withPagination, withFilters)(InterDepartmentTransferPage);
