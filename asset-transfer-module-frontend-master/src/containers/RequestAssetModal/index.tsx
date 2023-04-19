/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { uniqBy } from 'lodash';
import { ColumnsType } from 'antd/lib/table';
import { CloseOutlined } from '@ant-design/icons';

import ModalComponent from '@/components/Modal';
import ResultsComponent from '@/components/Result';
import { useMutation } from '@/hooks/useMutate';
import { API_ROUTES, HTTP_TYPES, MESSAGES } from '@/utils/constants';
import { Alert, Button, Form, InputNumber, message, Select } from 'antd';
import TableComponent from '@/containers/Table';
import { useAppSelector } from '@/hooks/useRedux';
import TextArea from 'antd/lib/input/TextArea';

import './styles.scss';
import { AssetCategorie } from '@/store/asset-category';

interface AssetRequest {
  category: string;
  quantity: number;
  remaningQuantity: number | string;
  isBudgeted: boolean;
  key: string;
  remark?: '';
}

const { Option } = Select;

interface UnBudgeted {
  category: string;
  budgetQuantity: number;
  unBudgteQuantity: number;
}

interface Props {
  onAfterSubmit: () => void;
}

const RequestAssetModal: FC<Props> = ({ onAfterSubmit }): JSX.Element => {
  const [form] = Form.useForm();
  const { assetCategories: importCategories } = useAppSelector((store) => store.assetCategory);
  const [assetCategories, setAssetCategories] = useState<AssetCategorie[]>([]);

  useEffect(() => {
    setAssetCategories(importCategories);
  }, [importCategories]);

  // const { buildings } = useAppSelector((store) => store.buildings);
  // const { floors } = useAppSelector((store) => store.floors);
  const { user } = useAppSelector((store) => store.user);

  const [visible, setVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [category, setCategory] = useState('');
  // const [building, setBuilding] = useState('');
  // const [floor, setFloor] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [bRequestId, setBRequestId] = useState('');
  const [ubRequestId, setUbRequestId] = useState('');
  // const [department, setDepartment] = useState<number | null>(null);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [isUnbudget, setIsUnbudget] = useState<UnBudgeted | null>(null);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.ASSET_REQUEST.ALL,
  });

  const onDoneClick = () => {
    setIsSuccess(false);
    handleCancelClick();
    setAssetCategories(importCategories);
  };

  const handleSubmit = async () => {
    const budgetItems = requests.filter((request) => request.isBudgeted);
    const unbudgetItems = requests.filter((request) => !request.isBudgeted);
    let assetRequests: any = [];

    if (budgetItems.length > 0) {
      assetRequests = [
        ...assetRequests,
        {
          isBudgeted: true,
          requestItems: budgetItems?.map((item) => ({
            quantity: item.quantity,
            categoryId: assetCategories.find(
              (asset) => asset.name === item.category.replace(' - (Budgeted)', ''),
            )?.id,
          })),
        },
      ];
    }

    if (unbudgetItems.length > 0) {
      assetRequests = [
        ...assetRequests,
        {
          isBudgeted: false,
          requestItems: unbudgetItems?.map((item) => ({
            quantity: item.quantity,
            remarks: item.remark || '',
            categoryId: assetCategories.find(
              (asset) => asset.name === item.category.replace(' - (UnBudgeted)', ''),
            )?.id,
          })),
        },
      ];
    }
    const body = {
      userId: user?.id,
      branchId: user?.branch?.id,
      assetRequests,
      // buildingId: buildings.find((bu) => bu.name === building)?.id || 0,
      // floorId: floors.find((fo) => fo.name === floor)?.id || 0,
    };
    const res = await mutate(body);

    if (res.success) {
      const data = res.data?.data;
      const bReqId = data[0]?.isBudgeted ? data[0]?.requestId : data[1]?.requestId;
      const ubReqId = data[0]?.isBudgeted ? data[1]?.requestId : data[0]?.requestId;
      setIsSuccess(true);
      setRequests([]);
      onAfterSubmit();
      setBRequestId(bReqId);
      setUbRequestId(ubReqId);
      return;
    } else {
      message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
      return;
    }
  };

  const colums: ColumnsType<object> = [
    {
      title: 'Asset Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Remark',
      dataIndex: 'remark',
      key: 'remark',
      render(value, record) {
        return (
          <TextArea
            value={value || ''}
            onChange={(e) => {
              const allRequests = requests.map((req) => {
                // @ts-ignore
                if (req.key === record.key) {
                  // @ts-ignore
                  req.remark = e.target.value;
                }

                return req;
              });
              setRequests(allRequests);
            }}
          />
        );
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Remaining Qty',
      dataIndex: 'remaningQuantity',
      key: 'remaningQuantity',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   @ts-ignore
      render: (_: string, record: AssetRequest) => (
        <CloseOutlined className='pointer' onClick={() => onRemoveItem(record.key)} />
      ),
    },
  ];

  const onRemoveItem = (key: string) => {
    const remaingItems = requests.filter((item) => item.key !== key);
    setRequests(remaingItems);
  };

  const checkAssetDetails = async () => {
    const selectedCategory = assetCategories.find(
      (assetCategory) => assetCategory.name === category,
    );
    const res = await mutate(
      {},
      HTTP_TYPES.GET,
      {},
      API_ROUTES.BUDGET.BUDGTE_BY_CATEGORY_AND_BRANCH.replace(
        '#{branchId}',
        `${user?.branch?.id || 2}`,
      ).replace('#{categoryId}', `${selectedCategory?.id}`),
    );

    if (res.success) {
      let availableContity = res?.data?.data?.quantity - res?.data?.data?.requestedQuantity;

      if (isNaN(availableContity)) {
        availableContity = 0;
      }
      if (availableContity >= quantity) {
        const allRequests: AssetRequest[] = [
          {
            category: `${category} - (Budgeted)`,
            isBudgeted: true,
            quantity,
            remark: '',
            remaningQuantity: availableContity - quantity,
            key: `${category}_Budgeted`,
          },
          ...requests,
        ];
        setRequests(uniqBy(allRequests, (request) => request.key).reverse());
        setQuantity(0);
        setCategory('');
        form.resetFields();
        return;
      }

      const unBudgteQuantity = Math.abs(availableContity - quantity);

      setIsUnbudget({
        budgetQuantity: quantity - unBudgteQuantity,
        unBudgteQuantity,
        category,
      });
      // setting selected categories department's categories selectable
      setAssetCategories(
        assetCategories.filter(
          (cat: AssetCategorie) => cat.departmentId === selectedCategory?.departmentId,
        ),
      );
      return;
    }

    message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
  };

  const handleCancelClick = () => {
    setCategory('');
    setQuantity(0);
    setRequests([]);
    setVisible(false);
    form.resetFields();
    setIsUnbudget(null);
    setAssetCategories(importCategories);
  };

  const handleUnbudgedItems = () => {
    if (isUnbudget) {
      let allRequests: AssetRequest[] = [];
      if (isUnbudget?.budgetQuantity > 0) {
        allRequests = [
          {
            category: `${category} - (UnBudgeted)`,
            isBudgeted: false,
            quantity: isUnbudget?.unBudgteQuantity,
            remaningQuantity: 'N/A',
            key: `${category}_UnBudgeted`,
          },
          {
            category: `${category} - (Budgeted)`,
            isBudgeted: true,
            quantity: isUnbudget?.budgetQuantity,
            remaningQuantity: 0,
            key: `${category}_Budgeted`,
          },
          ...requests,
        ];
      } else {
        allRequests = [
          {
            category: `${category} - (UnBudgeted)`,
            isBudgeted: false,
            quantity: isUnbudget?.unBudgteQuantity,
            remaningQuantity: 'N/A',
            key: `${category}_UnBudgeted`,
          },
          ...requests,
        ];
      }
      setRequests(uniqBy(allRequests, (request) => request.key).reverse());
      setQuantity(0);
      setCategory('');
      setIsUnbudget(null);
      form.resetFields();
      return;
    }
  };

  return (
    <>
      <Button className='request button3' onClick={() => setVisible(true)}>
        Request
      </Button>
      <>
        <ModalComponent
          title='Asset Request'
          visible={visible}
          onClose={handleCancelClick}
          width={isSuccess ? 600 : 1000}
        >
          <div className='RequestAssetModal'>
            {isSuccess ? (
              <>
                <ResultsComponent
                  status={'success'}
                  title='Successfully Requested Asset Transfer'
                  extra={[
                    <div key={'done'}>
                      <div className='requestNumbers'>
                        {bRequestId && (
                          <div className='requestNumbersBudget'>
                            <div>
                              Budget Request Number:{' '}
                              <span style={{ fontWeight: 900 }}>{bRequestId}</span>
                            </div>
                          </div>
                        )}
                        {ubRequestId && (
                          <div className='requestNumbersUnBudget'>
                            <div>
                              Unbudget Request Number:{' '}
                              <span style={{ fontWeight: 900 }}>{ubRequestId}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        className='button3'
                        style={{ color: 'white', marginTop: 20 }}
                        onClick={onDoneClick}
                      >
                        Done
                      </Button>
                    </div>,
                  ]}
                />
              </>
            ) : (
              <>
                {isUnbudget ? (
                  <>
                    <div className='unbudgeted'>
                      <div className='budgeted-details'>
                        <div className='title'>
                          Asset Category: <span>{category}</span>
                        </div>
                        <div className='title'>
                          Quantity: <span>{quantity}</span>
                        </div>
                      </div>
                      <div className='unbudgeted-details'>
                        <div className='title'>
                          Budgeted Quantity: <span>{isUnbudget?.budgetQuantity}</span>
                        </div>
                        <div className='title'>
                          Un-Budgeted Quantity: <span>{isUnbudget?.unBudgteQuantity}</span>
                        </div>
                      </div>
                    </div>
                    <Alert
                      className='warning'
                      message='Warning'
                      description={`There are ${isUnbudget?.unBudgteQuantity} unbudgeted ${category}. Unbugeted items will be sent as a separate asset request. Are you sure you want proceed ?`}
                      type='warning'
                      showIcon
                    />
                    <div className='action-buttons'>
                      <Button className='button5' onClick={() => setIsUnbudget(null)}>
                        No
                      </Button>
                      <Button className='button3' onClick={handleUnbudgedItems}>
                        Yes
                      </Button>
                    </div>
                  </>
                ) : (
                  <Form form={form}>
                    <div className='user-branch'>
                      <Form.Item label='Initiator' name='initiator'>
                        <div className='user'>{user?.userName}</div>
                      </Form.Item>
                      <Form.Item label='Location' name='location' className='branch'>
                        <div>{user?.branch?.name}</div>
                      </Form.Item>
                    </div>
                    <div className='category-quantity'>
                      {/* <Form.Item
                        className='category'
                        label='Location'
                        name='location'
                        required
                        rules={[{ required: true, message: 'Please select a location' }]}
                      >
                        <Select
                          style={{ width: 280 }}
                          placeholder='Location'
                          onChange={(e) => {
                            setBuilding(e);
                          }}
                          value={building}
                          showSearch={true}
                        >
                          {buildings?.map((building) => (
                            <Option key={building.id} value={building.name}>
                              {building.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        style={{ marginLeft: 10 }}
                        className='category'
                        label='Floor'
                        name='floor'
                        required
                        rules={[{ required: true, message: 'Please select a floor' }]}
                      >
                        <Select
                          style={{ width: 280 }}
                          placeholder='Floor'
                          onChange={(e) => {
                            setFloor(e);
                          }}
                          value={floor}
                          showSearch={true}
                        >
                          {floors?.map((floor) => (
                            <Option key={floor.id} value={floor.name}>
                              {floor.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item> */}
                    </div>
                    <div className='category-quantity'>
                      <Form.Item
                        className='category'
                        label='Asset Category'
                        name='category'
                        required
                        rules={[{ required: true, message: 'Please select a asset category' }]}
                      >
                        <Select
                          style={{ width: 300 }}
                          placeholder='Category'
                          onChange={(e) => {
                            setCategory(e);
                          }}
                          value={category}
                          showSearch={true}
                        >
                          {assetCategories?.map((assetCategory) => (
                            <Option key={assetCategory.id} value={assetCategory.name}>
                              {assetCategory.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item className='quantity' label='Quantity' name='quantity' required>
                        <InputNumber
                          style={{ width: 50 }}
                          stringMode={false}
                          onChange={(e: number) => setQuantity(e)}
                          min={1}
                        />
                      </Form.Item>
                      <Button
                        className='add button3'
                        disabled={!category || !quantity}
                        onClick={checkAssetDetails}
                      >
                        Add
                      </Button>
                    </div>

                    <div className='action-buttons'>
                      <Button className='button5' disabled={loading} onClick={handleCancelClick}>
                        Cancel
                      </Button>
                      <Button
                        className='button'
                        disabled={loading || requests.length === 0}
                        onClick={handleSubmit}
                      >
                        Submit
                      </Button>
                    </div>
                  </Form>
                )}
              </>
            )}
            {!isUnbudget && requests.length > 0 && (
              <TableComponent columns={colums} data={requests} />
            )}
          </div>
        </ModalComponent>
      </>
    </>
  );
};

export default RequestAssetModal;
