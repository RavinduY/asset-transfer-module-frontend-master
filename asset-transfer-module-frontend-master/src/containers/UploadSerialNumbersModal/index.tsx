import FileDragger from '@/components/FileDragger';
import ModalComponent from '@/components/Modal';
import ResultsComponent from '@/components/Result';
import { useMutation } from '@/hooks/useMutate';
import {} from '@/pages/CostPerUnitPage';
import { API_ROUTES } from '@/utils/constants';
import { readXlAsJson } from '@/utils/xl';
import { Alert, Button, message } from 'antd';
import { RcFile } from 'antd/lib/upload';
import { FC, useState } from 'react';
import TableComponent from '@/containers/Table';

interface CBCS {
  cbc: string;
  manufactureSerial: string;
  key: number;
}

const column = [
  {
    title: 'CBC',
    dataIndex: 'cbc',
    key: 'cbc',
  },
  {
    title: 'Manufacture Serial',
    dataIndex: 'manufactureSerial',
    key: 'manufactureSerial',
  },
];

const UploadSerialNumbersModal: FC = (): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const [cbcs, setCbcs] = useState<CBCS[]>([]);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.PO_GENERATION.SET_SERIAL,
  });

  const onDoneClick = () => {
    setCbcs([]);
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
      const cbcs: CBCS[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((data: any, i) => {
        cbcs.push({
          cbc: data[0],
          manufactureSerial: data[1],
          key: i,
        });
      });

      cbcs.forEach((cbc: CBCS, i: number) => {
        const values = Object.values(cbc);
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
      setCbcs(cbcs.filter((_: object, i: number) => i !== 0));
      return;
    }
    message.error('Invalid Format');
  };

  const saveSerialNumbers = async () => {
    const data = cbcs?.map((cbc) => ({
      cbc: cbc.cbc,
      manufactureSerial: cbc.manufactureSerial,
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
        Upload Serial Numbers
      </Button>
      <div>
        <ModalComponent
          title='Upload Serial Numbers'
          visible={visible}
          onClose={() => setVisible(false)}
          width={isSuccess ? 600 : cbcs?.length > 0 ? 1200 : 600}
        >
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
                {cbcs.length === 0 ? (
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
                  <div style={{ paddingBottom: 30 }}>
                    <Button
                      className='button2'
                      style={{ float: 'right', marginBottom: 10, color: 'white' }}
                      onClick={() => setCbcs([])}
                    >
                      Upload Again
                    </Button>
                    <TableComponent data={cbcs} columns={column} />
                    <Button
                      className='button'
                      style={{ float: 'right', marginTop: 10, color: 'white' }}
                      disabled={loading}
                      onClick={saveSerialNumbers}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        </ModalComponent>
      </div>
    </>
  );
};

export default UploadSerialNumbersModal;
