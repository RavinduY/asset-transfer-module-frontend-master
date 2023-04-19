/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import CollapseComponent from '@/components/Collapse';
import SetpsComponent, { Steps } from '@/components/SetpsComponent';
import TableComponent from '@/containers/Table';
import { useQuery } from '@/hooks/useQuery';
import { API_ROUTES, MOMENT_FORMATS } from '@/utils/constants';
import Spinner from '@/components/Spinner';

import './styles.scss';

interface Props {
  id: number;
  requestId: string;
  onCancel: () => void;
  setWidth: (width: number) => void;
}

const columns: ColumnsType<object> = [
  {
    title: 'User',
    dataIndex: 'user',
    key: 'user',
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (_: string, row: any) => {
      return <>{row?.action?.action?.name}</>;
    },
  },
  {
    title: 'Details',
    dataIndex: 'details',
    key: 'details',
    render: (_: string, row: any) => {
      return <>{row?.action?.comments}</>;
    },
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
  },
];

const dispatchColumns: ColumnsType<object> = [
  {
    title: 'User',
    dataIndex: 'user',
    key: 'user',
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (_: string, row: any) => {
      return <>{row?.action?.action?.name}</>;
    },
  },
  {
    title: 'Details',
    dataIndex: 'details',
    key: 'details',
    render: (_: string, row: any) => {
      return <>{row?.action?.comments}</>;
    },
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'GatePass Downloader',
    dataIndex: 'downloader',
    key: 'downloader',
  },
];

interface StatusData {
  user: string;
  action: string;
  details?: string;
  date: string;
  time: string;
}

interface DispatchStatusData {
  user: string;
  action: string;
  details?: string;
  date: string;
  downloader?: string;
}

const AssetRequestOverviewModal: FC<Props> = ({
  id,
  requestId,
  onCancel,
  setWidth,
}): JSX.Element => {
  const [actions, setActions] = useState<StatusData[]>([]);
  const [steps, setSteps] = useState<Steps[]>([]);
  const [dispatchSteps, setDispatchSteps] = useState<Steps[]>([]);
  const [dispatchData, setDispatchData] = useState<DispatchStatusData[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentDStep, setCurrentDStep] = useState(0);
  const { data, loading } = useQuery({
    url: API_ROUTES.REQUEST_STATUS.STATUS_BY_REQTEST_ID.replace('#{id}', `${id}`),
  });

  const { data: assetDispatchData } = useQuery({
    url: API_ROUTES.ASSET_REQUEST.ASSET_REQUEST_DISPATCH.replace('#{id}', `${id}`),
  });

  useEffect(() => {
    if (assetDispatchData && Array.isArray(assetDispatchData)) {
      let currentStep = 0;
      assetDispatchData
        ?.filter((action) => action?.action?.isVisible)
        ?.forEach((action, i) => {
          if (action.id && action.user) {
            currentStep = i;
          }
        });

      setCurrentDStep(currentStep);

      setDispatchSteps(
        assetDispatchData
          ?.filter((action) => action?.action?.isVisible)
          ?.map((action) => ({
            title: action?.action?.name,
            description: action?.user?.userName,
          })),
      );
      setDispatchData(
        assetDispatchData?.map((action: any, i: number) => ({
          action: action,
          date: moment(new Date(action?.createdAt)).format(MOMENT_FORMATS.YYYY_DD_MM),
          details: action?.comments,
          user: action?.user?.userName,
          downloader: action?.downloader?.userName || '',
          key: i,
        })),
      );
    }
  }, [assetDispatchData]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setActions(
        data?.map((action: any, i: number) => ({
          action: action,
          date: moment(new Date(action?.createdAt)).format(MOMENT_FORMATS.YYYY_DD_MM),
          details: action?.comments,
          user: action?.user?.userName,
          time: moment(new Date(action?.createdAt)).format(MOMENT_FORMATS.HHMM),
          key: i,
        })),
      );

      let currentStep = 0;
      data
        ?.filter((action) => action?.action?.isVisible)
        ?.forEach((action, i) => {
          if (action?.action?.isVisible && action.id && action.user) {
            currentStep = i;
          }
        });

      setCurrentStep(currentStep);
      setSteps(
        data
          ?.filter((action) => action?.action?.isVisible)
          ?.map((action) => ({
            title: action?.action?.name,
            description: `${
              !action?.user?.firstName && !action?.user?.firstName
                ? action?.user?.userName || ''
                : ''
            } ${action?.user?.firstName || ''} ${action?.user?.lastName || ''} ${
              action?.createdAt
                ? `Date:${moment(new Date(action?.createdAt)).format('YYYY/MM/DD')}`
                : ''
            }`,
          })),
      );
    }
  }, [data]);

  useEffect(() => {
    if (steps.length > 6) {
      const extraCount = steps.length - 6;
      setWidth(900 + 150 * extraCount);
    }
  }, [steps]);
  return (
    <div className='AssetRequestOverviewModal'>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <h3 className='title'>Approvals {requestId}</h3>
          <div className='steps-component'>
            <SetpsComponent current={currentStep} status='process' steps={steps} />
          </div>
          <div className='collapse-component'>
            <CollapseComponent
              items={[
                {
                  header: 'More Info',
                  body: (
                    <TableComponent
                      loading={loading}
                      columns={columns}
                      data={actions.filter((action: any) => action?.action.id)}
                      pagination={{
                        size: 'small',
                        pageSize: 10,
                      }}
                    />
                  ),
                },
              ]}
            />
          </div>
          {(dispatchSteps.length > 0 || dispatchData.length > 0) && (
            <>
              <h3 className='title'>Dispatch {requestId}</h3>
              {dispatchSteps.length > 0 && (
                <div className='steps-component'>
                  <SetpsComponent current={currentDStep} status='process' steps={dispatchSteps} />
                </div>
              )}
              {dispatchData.length > 0 && (
                <div className='collapse-component'>
                  <CollapseComponent
                    items={[
                      {
                        header: 'More Info',
                        body: (
                          <TableComponent
                            loading={loading}
                            columns={dispatchColumns}
                            data={dispatchData.filter((action: any) => action?.action.id)}
                            pagination={{
                              size: 'small',
                              pageSize: 10,
                            }}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              )}
            </>
          )}
          <Button className='close button5' onClick={onCancel}>
            Close
          </Button>
        </>
      )}
    </div>
  );
};

export default AssetRequestOverviewModal;
