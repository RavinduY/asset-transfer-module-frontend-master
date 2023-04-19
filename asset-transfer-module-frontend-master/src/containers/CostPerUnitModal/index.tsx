import FileDragger from '@/components/FileDragger';
import ModalComponent from '@/components/Modal';
import ResultsComponent from '@/components/Result';
import { useMutation } from '@/hooks/useMutate';
import { UnitPrice } from '@/pages/CostPerUnitPage';
import { API_ROUTES } from '@/utils/constants';
import { readXlAsJson } from '@/utils/xl';
import { Alert, Button, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RcFile } from 'antd/lib/upload';
import { FC, useState } from 'react';
import TableComponent from '@/containers/Table';

import './styles.scss';
import Spinner from '@/components/Spinner';

export const costPerUnitColumns: ColumnsType<object> = [
  {
    title: 'Asset Category',
    dataIndex: 'assetCategory',
    key: 'assetCategory',
  },
  {
    title: 'Cost Per Unit (Rs)',
    dataIndex: 'costPerUnit',
    key: 'costPerUnit',
  },
];

const CostPerUnitModal: FC = (): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const [costs, setCosts] = useState<UnitPrice[]>([]);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.COST_PER_UNIT.BULK_CREATE,
  });

  const onDoneClick = () => {
    setCosts([]);
    setIsSuccess(false);
    setVisible(false);
  };

  const handleOnBeforeUpload = (file: RcFile) => {
    const fileNameSplit = file.name.split('.');
    const isXl = fileNameSplit[fileNameSplit.length - 1] === 'xlsx';
    if (!isXl) {
      message.error('Please select a xl file');
    }
    return isXl;
  };
  const handleOnChange = (e: File) => {
    setError('');
    readXlAsJson(e, formatData);
  };

  const formatData = (data: unknown[]) => {
    if (Array.isArray(data)) {
      let errors: string[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const costsPerUnit: UnitPrice[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((data: any, i) => {
        if (data[0] || data[1]) {
          costsPerUnit.push({
            assetCategory: data[0],
            costPerUnit: data[1],
            key: i,
          });
        }
      });
      costsPerUnit.forEach((user: UnitPrice, i: number) => {
        const values = Object.values(user);
        if (values.length !== 3) {
          errors = [...errors, `Error in line ${i + 1}`];
          return;
        }
        const isEmpty = values.some((value) => value === '');
        if (isEmpty) {
          errors = [...errors, `Error in line ${i + 1}`];
          return;
        }
      });
      if (errors.length > 0) {
        return setError(errors[0]);
      }
      setCosts(costsPerUnit.filter((_: object, i: number) => i !== 0));
      return;
    }
    message.error('Invalid Format');
  };

  const saveCosts = async () => {
    const data = costs?.map((cost) => ({
      name: cost.assetCategory,
      revicedCost: parseFloat(`${cost.costPerUnit}`),
    }));
    const res = await mutate(data);
    if (res.success) {
      setIsSuccess(true);
      return;
    }
  };

  return (
    <>
      <Button className='upload button3' onClick={() => setVisible(true)}>
        Upload
      </Button>
      <>
        <ModalComponent
          title='Unit Cost'
          visible={visible}
          onClose={() => setVisible(false)}
          width={isSuccess ? 600 : costs?.length > 0 ? 1200 : 600}
        >
          <>
            {loading ? (
              <Spinner />
            ) : (
              <>
                {isSuccess ? (
                  <>
                    <ResultsComponent
                      status={'success'}
                      title='Successfully Uploaded'
                      extra={[
                        <Button className='done-button' key={'done'} onClick={onDoneClick}>
                          Done
                        </Button>,
                      ]}
                    />
                  </>
                ) : (
                  <>
                    {costs.length === 0 ? (
                      <>
                        <div className='file-dragger'>
                          <FileDragger
                            title='Click or drag execl file here'
                            description='Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files'
                            beforeUpload={handleOnBeforeUpload}
                            onChange={handleOnChange}
                          />
                        </div>
                        {error && (
                          <Alert
                            className='file-dragger-error'
                            message='Error'
                            description={error}
                            type='error'
                          />
                        )}
                      </>
                    ) : (
                      <div className='user-preview'>
                        <Button
                          className='button2'
                          style={{ color: 'white', float: 'right' }}
                          onClick={() => setCosts([])}
                        >
                          Upload Again
                        </Button>
                        <TableComponent data={costs} columns={costPerUnitColumns} />
                        <Button
                          className='button'
                          disabled={loading}
                          onClick={saveCosts}
                          style={{ color: 'white', float: 'right', marginTop: '10px' }}
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        </ModalComponent>
      </>
    </>
  );
};

export default CostPerUnitModal;
