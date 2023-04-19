/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useState } from 'react';
import { Alert, Button, DatePicker, Form, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import ModalComponent from '@/components/Modal';
import FileDragger from '@/components/FileDragger';
import { RcFile } from 'antd/lib/upload';
import { readXlAsJson } from '@/utils/xl';
import ResultsComponent from '@/components/Result';
import TableComponent from '@/containers/Table';
import { API_ROUTES, MOMENT_FORMATS } from '@/utils/constants';
import { useMutation } from '@/hooks/useMutate';

import './styles.scss';

const budgetColumns: ColumnsType<object> = [
  {
    title: 'Branch Name',
    dataIndex: 'branchName',
    key: 'branchName',
    // @ts-ignore
    sorter: (a, b) => b.branchName.localeCompare(a.branchName),
    sortDirections: ['descend'],
  },
  {
    title: 'Budget Type',
    dataIndex: 'budgetType',
    key: 'budgetType',
    // @ts-ignore
    sorter: (a, b) => b.budgetType.localeCompare(a.budgetType),
    sortDirections: ['descend'],
  },
  {
    title: 'Asset Category',
    dataIndex: 'assetCategory',
    key: 'assetCategory',
    // @ts-ignore
    sorter: (a, b) => b.assetCategory.localeCompare(a.assetCategory),
    sortDirections: ['descend'],
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    // @ts-ignore
    sorter: (a, b) => b.quantity.localeCompare(a.quantity),
    sortDirections: ['descend'],
  },
  {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
    // @ts-ignore
    sorter: (a, b) => b.balance.localeCompare(a.balance),
    sortDirections: ['descend'],
  },
];

const findXlSheetError = (index: number): string => {
  switch (index) {
    case 0: {
      return 'Branch Name';
    }
    case 1: {
      return 'Budget Type';
    }
    case 2: {
      return 'Asset Category';
    }
    case 3: {
      return 'Quantity';
    }
    case 4: {
      return 'Balance';
    }
    case 5: {
      return 'Cost per unit';
    }
    default:
      return '';
  }
};

interface Props {
  onAfterSubmit: () => void;
}

const BudgetUploadModal: FC<Props> = ({ onAfterSubmit }): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const [year, setYear] = useState<moment.Moment>(moment(new Date()));
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.BUDGET.BULK_CREATE,
  });

  const handleOnBeforeUpload = (file: RcFile) => {
    const fileNameSplit = file.name.split('.');
    const isXl = fileNameSplit[fileNameSplit.length - 1] === 'xlsx';
    if (!isXl) {
      message.error('Please select a xl file');
    }
    return isXl;
  };

  const formatData = (data: unknown[]) => {
    let errors: string[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let budgets: any = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((budgetData: any) => {
      budgets = [
        ...budgets,
        {
          branchName: budgetData[0],
          budgetType: budgetData[1],
          assetCategory: budgetData[2],
          quantity: budgetData[3],
          balance: budgetData[4],
        },
      ];
    });

    budgets.forEach((budget: object, i: number) => {
      const values = Object.values(budget);
      values?.map((_, j) => {
        if (j === 0) {
          return;
        }
        if (_ === null || _ === undefined || _ === '') {
          errors = [...errors, `Error in ${findXlSheetError(j)} at line ${i + 1}`];
          return;
        }
      });
    });
    if (errors.length > 0) {
      return setError(errors[0]);
    }
    setBudgets(
      budgets
        .filter((_: object, i: number) => i !== 0)
        ?.map((data: any, j: number) => ({
          key: j,
          ...data,
          branchName: `${data.branchName}`.trimEnd(),
        })),
    );
  };

  const handleOnChange = (e: File) => {
    setError('');
    readXlAsJson(e, formatData);
  };

  const handleUploadAgainClick = () => {
    setBudgets([]);
  };

  const handleSaveClick = async () => {
    const res = await mutate({
      data: budgets?.map((budget: any) => ({
        branch: budget.branchName,
        quantity: parseInt(budget.quantity, 10),
        budgetType: budget.budgetType,
        assetCategory: budget.assetCategory,
        balance: parseInt(budget.balance, 10),
        year: year.format('YYYY'),
      })),
      year: year.format('YYYY'),
    });
    if (res.success) {
      setIsSuccess(true);
      onAfterSubmit();
      return;
    }

    const errors: any = res.errors;
    const messages: string[] = errors?.data?.data || [];

    messages?.map((error) => {
      message.error({ content: error, duration: 20 });
    });
  };

  const onDoneClick = () => {
    setVisible(false);
    setIsSuccess(false);
    setBudgets([]);
  };

  return (
    <div className='BudgetUploadModal'>
      <Button className='button3' onClick={() => setVisible(true)}>
        Upload
      </Button>
      <ModalComponent
        visible={visible}
        onClose={() => {
          setVisible(false);
          setBudgets([]);
        }}
        title='Budget Upload'
        width={isSuccess ? 600 : budgets.length === 0 ? 800 : 1200}
      >
        <>
          {isSuccess ? (
            <ResultsComponent
              status={'success'}
              title={`Successfully Upload Budget - ${moment(year).format(MOMENT_FORMATS.YYYY)}`}
              extra={[
                <Button className='done-button' key={'done'} onClick={onDoneClick}>
                  Done
                </Button>,
              ]}
            />
          ) : (
            <Form className='budget-form'>
              <Form.Item label='Budget Year' name='year' wrapperCol={{ offset: 1, span: 22 }}>
                <div>
                  <DatePicker
                    value={year}
                    className='date-picker'
                    picker='year'
                    bordered={true}
                    onChange={(e) => {
                      setYear(moment(e));
                    }}
                    placeholder='Select Year'
                  />
                  {budgets.length > 0 && (
                    <Button className='upload-button button3' onClick={handleUploadAgainClick}>
                      Upload Again
                    </Button>
                  )}
                </div>
              </Form.Item>
              {budgets.length === 0 ? (
                <Form.Item label='Budget' name='budget' wrapperCol={{ offset: 2, span: 16 }}>
                  <FileDragger
                    title='Click or drag execl file here'
                    description='Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files'
                    beforeUpload={handleOnBeforeUpload}
                    onChange={handleOnChange}
                  />
                  {error && (
                    <Alert
                      className='file-dragger-error'
                      message='Error uploading file'
                      description={error}
                      type='error'
                    />
                  )}
                </Form.Item>
              ) : (
                <div className='budget-preview'>
                  <TableComponent
                    data={budgets}
                    columns={budgetColumns}
                    pagination={{
                      size: 'small',
                      pageSize: 10,
                      showSizeChanger: true,
                    }}
                  />
                  <Button
                    onClick={handleSaveClick}
                    className='save-button button'
                    disabled={loading}
                  >
                    Save
                  </Button>
                </div>
              )}
            </Form>
          )}
        </>
      </ModalComponent>
    </div>
  );
};

export default BudgetUploadModal;
