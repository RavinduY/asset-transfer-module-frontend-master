/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import CollapseComponent from '@/components/Collapse';
import SetpsComponent, { Steps } from '@/components/SetpsComponent';
import TableComponent from '@/containers/Table';
import { useQuery } from '@/hooks/useQuery';
import { MOMENT_FORMATS } from '@/utils/constants';
import ModalComponent from '@/components/Modal';
import { orderBy } from 'lodash';

import './styles.scss';

interface Props {
  id: number;
  title: string;
  url: string;
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
      return <>{row?.action?.comments || row?.action?.details}</>;
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

interface StatusData {
  user: string;
  action: string;
  details?: string;
  date: string;
  time: string;
}

const RequestOverviewModal: FC<Props> = ({ title, url }): JSX.Element => {
  const [actions, setActions] = useState<StatusData[]>([]);
  const [steps, setSteps] = useState<Steps[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  const { data, loading, retry } = useQuery({
    url,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    if (visible) {
      retry();
    }
  }, [visible]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setActions(
        data?.map((action: any, i: number) => ({
          action: action,
          date: moment(new Date(action?.createdAt)).format(MOMENT_FORMATS.YYYY_DD_MM),
          time: moment(new Date(action?.createdAt)).format(MOMENT_FORMATS.HHMM),
          details: action?.comments,
          user: action?.user?.userName,
          key: i,
        })),
      );

      let currentStep = 0;
      data
        ?.filter((action: any) => {
          return action?.action?.isVisible;
        })
        ?.forEach((action, i) => {
          if (action.id && action?.action?.isVisible) {
            currentStep = i;
          }
        });
      setCurrentStep(currentStep);

      setSteps(
        orderBy(
          data
            ?.filter((action: any) => {
              return action?.action?.isVisible;
            })
            ?.map((action) => ({
              title: action?.action?.name,
              description: (
                <>
                  {action?.user?.firstName} {action?.user?.lastName}
                  <br />
                  {action?.createdAt &&
                    `Date: ${moment(new Date(action?.createdAt)).format('DD-MM-YYYY')}`}
                </>
              ),
            })) || [],
          'id',
        ),
      );
    }
  }, [data]);

  return (
    <>
      <div className='title' onClick={() => setVisible(true)}>
        {title}
      </div>
      <ModalComponent visible={visible} onClose={() => setVisible(false)} title={title} width={800}>
        <div className='RequestOverviewModal'>
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
          {/* <h3 className='title'>Dispatch {title}</h3>
      <div className='steps-component'>
        <SetpsComponent current={currentStep} status='process' steps={steps} />
      </div> */}
          <Button className='close' onClick={() => setVisible(false)}>
            Close
          </Button>
        </div>
      </ModalComponent>
    </>
  );
};

export default RequestOverviewModal;
