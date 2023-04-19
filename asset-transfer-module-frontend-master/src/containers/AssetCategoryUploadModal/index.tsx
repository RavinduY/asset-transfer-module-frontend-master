/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useState } from 'react';
import { Alert, Button, Form, List, message, Select } from 'antd';
import ModalComponent from '@/components/Modal';
import FileDragger from '@/components/FileDragger';
import { RcFile } from 'antd/lib/upload';
import { readXlAsJson } from '@/utils/xl';
import ResultsComponent from '@/components/Result';
import { useMutation } from '@/hooks/useMutate';
import { useAppSelector } from '@/hooks/useRedux';

import './styles.scss';
import { API_ROUTES } from '@/utils/constants';

interface Props {
  show: boolean;
  isDepartment: boolean;
  close: VoidFunction;
}

const { Option } = Select;

const AssetCategoryUploadModal: FC<Props> = ({ show, close, isDepartment }): JSX.Element => {
  const { departments } = useAppSelector((store) => store.departments);

  const [assetCategories, setAssetCategories] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [department, setDepartment] = useState(0);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { loading, mutate } = useMutation({
    url: API_ROUTES.COST_PER_UNIT.BULK_CREATE_CATEGORY,
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
    let assetCategories: any = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((assetCategoriesData: any) => {
      assetCategories = [
        ...assetCategories,
        {
          assetCategory: assetCategoriesData[0],
        },
      ];
    });
    assetCategories.forEach((category: object, i: number) => {
      const values = Object.values(category);
      values?.map((_) => {
        if (_ === '' || _ === null || _ === undefined) {
          errors = [...errors, `Error at line ${i + 1}`];
          return;
        }
      });
    });
    if (errors.length > 0) {
      return setError(errors[0]);
    }
    setAssetCategories(
      assetCategories
        ?.filter((_: object, i: number) => i !== 0)
        ?.map((data: object, j: number) => ({ key: j, ...data })),
    );
  };

  const handleOnChange = (e: File) => {
    setError('');
    readXlAsJson(e, formatData);
  };

  const handleUploadAgainClick = () => {
    setAssetCategories([]);
  };

  const handleSaveClick = async () => {
    let body: any = {
      categories: assetCategories?.map((category: any) => ({
        name: category.assetCategory,
      })),
    };

    if (isDepartment) {
      body = {
        ...body,
        departmentName: department,
      };
    }

    const res = await mutate(body);
    if (res.success) {
      setIsSuccess(true);
      return;
    } else {
      message.error('Something went wrong please try again');
    }
  };

  const onDoneClick = () => {
    setIsSuccess(false);
    setAssetCategories([]);
  };

  const onDepartmentChange = (value: number) => {
    setDepartment(value);
  };

  const saveDisabled = () => {
    if (loading) return true;
    if (isDepartment && !department) {
      return true;
    }

    return false;
  };

  return (
    <div className='AssetCayegoryUploadModal'>
      <ModalComponent
        visible={show}
        onClose={close}
        width={800}
        title={
          isDepartment ? 'Upload Department Branch Asset Category' : 'Upload Branch Asset Category'
        }
      >
        <>
          {assetCategories.length > 0 && (
            <Button
              className='upload-button button2'
              style={{ color: 'white', float: 'right' }}
              onClick={handleUploadAgainClick}
            >
              {isDepartment ? 'Upload again without saving' : 'Upload again'}
            </Button>
          )}
          <br />
          <br />
          {isSuccess ? (
            <ResultsComponent
              status={'success'}
              title={'Successfully Uploaded Asset Categories'}
              extra={[
                <Button className='done-button' key={'done'} onClick={onDoneClick}>
                  Done
                </Button>,
              ]}
            />
          ) : (
            <Form className='asset-category-form'>
              {isDepartment && (
                <Form.Item
                  label='Department'
                  name='department'
                  wrapperCol={{ offset: 1, span: 22 }}
                >
                  <div>
                    <Select
                      className='department-selection'
                      allowClear
                      placeholder='Select a department'
                      optionFilterProp='children'
                      onChange={onDepartmentChange}
                    >
                      {departments?.map((department) => (
                        <Option value={department?.name} key={department?.id}>
                          {department?.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Form.Item>
              )}

              <>
                {assetCategories.length > 0 ? (
                  <>
                    <List
                      className='asset-categories'
                      header='Category'
                      bordered
                      size='large'
                      pagination={{
                        size: 'small',
                        pageSize: 10,
                        showSizeChanger: true,
                      }}
                      dataSource={assetCategories}
                      renderItem={(item: { key: number; assetCategory: string }) => (
                        <List.Item>{item.assetCategory}</List.Item>
                      )}
                    />
                    <Button
                      onClick={handleSaveClick}
                      className='save-button button3'
                      disabled={saveDisabled()}
                      style={{ color: 'white', float: 'right', marginTop: '10px' }}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Form.Item
                    label='Asset category'
                    name='category'
                    wrapperCol={{ offset: 1, span: 22 }}
                  >
                    <FileDragger
                      title='Click or drag excel file here'
                      description='Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.'
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
                )}
              </>
            </Form>
          )}
        </>
      </ModalComponent>
    </div>
  );
};

export default AssetCategoryUploadModal;
