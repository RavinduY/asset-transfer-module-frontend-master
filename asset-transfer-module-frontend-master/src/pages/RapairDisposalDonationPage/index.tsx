/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, Input } from 'antd';
import { FC, useEffect, useState } from 'react';
import { PaginationProps, withPagination } from '@/components/Hoc/withPagination/withPagination';

import { API_ROUTES, MOMENT_FORMATS, USER_ROLES } from '@/utils/constants';
import ActionModal from '@/containers/ActionModal';
import { ColumnsType } from 'antd/lib/table';
import PaginationComponent from '@/components/Pagination';
import RepairTransferModal from '@/containers/RepairTransferModal';
import { SearchOutlined } from '@ant-design/icons';
import TableComponent from '@/containers/Table';
import { compose } from 'lodash/fp';
import { useQuery } from '@/hooks/useQuery';
import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import RequestOverviewModal from '@/containers/RequestOverviewModal';
import { FilterProps, withFilters } from '@/components/Hoc/withFilters/withFilters';
import { useNavigate } from 'react-router-dom';
import { downloadXL } from '@/utils/xl';
import { v4 as uuid } from 'uuid';
import { withAuthorization } from '@/components/Hoc/withAuthorization';
import { useAppSelector } from '@/hooks/useRedux';
import moment from 'moment';
import DownloadGatePass from '@/components/GatePass/DownloadGatepass';

import './styles.scss';

interface RapairDisposalDonationRequest {
  key: number;
  requestNumber: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  status: string;
}

type Props = PaginationProps & FilterProps;

const RapairDisposalDonationPage: FC<Props> = ({
  page,
  onPageChange,
  pageSize,
  url,
  setBaseUrl,
}): JSX.Element => {
  const { user } = useAppSelector((store) => store.user);

  const [searchText, setSearchText] = useState('');
  const [requests, setRequests] = useState<RapairDisposalDonationRequest[]>([]);
  const [requestId, setRequestId] = useState<string>(uuid());

  const { data, loading, meta, retry } = useQuery({
    url,
    page,
    pageSize,
    notFetchOnLoad: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    setBaseUrl(API_ROUTES.ASSET_TRANSFER.REMOVAL);
  }, []);

  useEffect(() => {
    if (url) {
      retry();
    }
  }, [url]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setRequests(
        data?.map((request) => {
          let quantity = 0;

          if (Array.isArray(request?.removalRequestCategories)) {
            request.removalRequestCategories.forEach((removalRequestCategory: any) => {
              quantity += removalRequestCategory?.items?.length || 0;
            });
          }
          return {
            key: request.id,
            id: request.id,
            requestNumber: request?.removalRequestId?.name,
            fromLocation: request?.fromDepartment?.name,
            toLocation: request.toDepartment?.name,
            quantity,
            status: request?.currentAction?.name,
            type: request.type,
            removalRequestId: request?.removalRequestId,
            ...request,
          };
        }),
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
      let quantity = 0;

      const formattedData = downloadData?.map((request) => {
        if (Array.isArray(request?.removalRequestCategories)) {
          request.removalRequestCategories.forEach(() => {
            quantity += request?.removalRequestCategories?.items?.length || 0;
          });
        }
        return {
          'Request Number': request?.removalRequestId?.name,
          'From Location': request?.fromDepartment?.name,
          'To Location': request.toDepartment?.name,
          Quantity: quantity,
          Status: request?.currentAction?.name,
          Type: request.type,
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
      render: (_: string, row: any) => {
        return (
          <RequestOverviewModal
            title={_}
            id={row.id}
            url={API_ROUTES.REMOVAL.GET_STATUS?.replace('#{id}', `${row.id}`)}
          />
        );
      },
    },
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_: string) => {
        return moment(new Date(_)).format(MOMENT_FORMATS.YYYY_DD_MM);
      },
    },
    {
      title: 'From Location',
      dataIndex: 'fromLocation',
      key: 'fromLocation',
    },
    {
      title: 'To Location',
      dataIndex: 'toLocation',
      key: 'toLocation',
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
      render: (_: string, row: any) => {
        const allData: any = data;
        const record = row as any;
        const selected = allData?.find((data: any) => data?.id === record?.id);

        return (
          <ActionModal
            color={selected?.currentAction?.color}
            status={_}
            onAfterSubmit={retry}
            data={allData?.find((data: any) => data?.id === row?.id)}
            id={row.id}
            items={selected?.removalRequestCategories?.map((item: any) => {
              return {
                id: item?.id,
                categoryName: item?.category?.name,
                cbcs: item?.items?.map((it: any) => it?.cbc),
                costPerUnits:
                  item?.category.revicedCost != 0
                    ? item?.category.revicedCost
                    : item?.category.cost || 0,
              };
            })}
            title={`${row?.type} Request - #${row?.removalRequestId?.name || ''}`}
            url={API_ROUTES.REMOVAL.CREATE_STATUS}
          />
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render: (_: string, row: any) => (
        <div>
          <DownloadGatePass
            url={API_ROUTES.GATEPASS.REMOVAL.replace('#{id}', row?.id)}
            visible={row?.gatePassAvailable}
            onAfterDownload={retry}
          />
          <DownloadGatePass
            isReprint={true}
            url={`/removal/getGatepass/reprint/${row?.id}`}
            onAfterDownload={retry}
            visible={row?.gatePassCount > 0}
            buttonText='Re Print'
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
        <Button className='button2' onClick={download}>
          Download
        </Button>
        {withAuthorization(
          <RepairTransferModal onAfterSubmit={retry} />,
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
      return navigate('/assert-transfer/repair-disposal-donetion');
    }
    navigate(`/assert-transfer/repair-disposal-donetion?requestId=${searchText}`);
  };

  const handleOnPageChange = (page: number, size: number) => {
    onPageChange('assert-transfer/repair-disposal-donetion', page, size);
  };

  return (
    <div className='RapairDisposalDonationPage' key={requestId}>
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

export default compose(withAuth, withPagination, withFilters)(RapairDisposalDonationPage);
