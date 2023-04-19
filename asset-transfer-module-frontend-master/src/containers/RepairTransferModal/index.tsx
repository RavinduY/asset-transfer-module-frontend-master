/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useEffect, useRef, useState } from 'react';
import { ColumnType } from 'antd/es/table';
import { FilterConfirmProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { uniqBy } from 'lodash';
import TextArea from 'antd/lib/input/TextArea';

import ResultsComponent from '@/components/Result';
import { useMutation } from '@/hooks/useMutate';
import { API_ROUTES, MESSAGES } from '@/utils/constants';
import { Button, Checkbox, Form, Input, InputRef, message, Select, Space } from 'antd';
import ModalComponent from '@/components/Modal';
import { useAppSelector } from '@/hooks/useRedux';
import TableComponent from '@/containers/Table';
import { ColumnsType } from 'antd/lib/table';
import { CloseOutlined, LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@/hooks/useQuery';
import Spinner from '@/components/Spinner';

import './styles.scss';
import { AssetCategorie } from '@/store/asset-category';

const { Option } = Select;

interface Asset {
  assetCategory: string;
  quantity: number;
  cbcNumbers: string[];
  ids: number[];
}

interface DataType {
  key: string;
  cbcNumber: string;
  action: string;
}

type DataIndex = keyof DataType;

export interface Item {
  cbc: string;
  id: number;
  manufactureSerial: string;
  name: string;
  poNum: string;
  grnNum?: string;
}

interface Props {
  onAfterSubmit: () => void;
}

type RequestType = 'Repair' | 'Disposal' | 'Donation';

const RepairTransferModal: FC<Props> = ({ onAfterSubmit }): JSX.Element => {
  const [form] = Form.useForm();

  const { user } = useAppSelector((store) => store.user);
  const [assetCategories, setAssetCategories] = useState<AssetCategorie[]>([]);
  const { departments } = useAppSelector((store) => store.departments);
  const [type, setType] = useState<RequestType>('Repair');

  const [visible, setVisible] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Item[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [requestId, setBRequestId] = useState('');

  const [items, setItems] = useState<Item[]>([]);

  const { data, retry } = useQuery({
    url: API_ROUTES.ASSET_TRANSFER.GET_ITEMS_BY_CATEGORY_REMOVAL.replace('#{categoryId}', category),
    notFetchOnLoad: true,
  });

  useEffect(() => {
    if (category) {
      retry();
    }
  }, [category]);

  const { data: assetCategoryData } = useQuery({
    url: '/asset_category/getCategoryByUserDepId?all=0',
  });

  useEffect(() => {
    if (assetCategoryData && Array.isArray(assetCategoryData)) {
      setAssetCategories(assetCategoryData);
    }
  }, [assetCategoryData]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setItems(data);
    }
  }, [data]);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.ASSET_TRANSFER.REMOVAL,
  });
  const onDoneClick = () => {
    setIsSuccess(false);
    setVisible(false);
    handleResetClick();
  };

  const handleChange = (cbcNumber: string) => {
    const isSelected = selectedAssets.some((asset) => cbcNumber === asset.cbc);

    if (isSelected) {
      setSelectedAssets((assets) => assets.filter((asset) => asset.cbc !== cbcNumber));
      let allData: string[] = [];
      selectedAssets
        .filter((asset) => asset?.cbc !== cbcNumber)
        .forEach((da) => {
          allData = [...allData, JSON.stringify(da)];
        });
      form.setFieldValue('assets', allData);
      return;
    }
    const allAssets = [...selectedAssets, items.find((item) => item.cbc === cbcNumber)].filter(
      (asset) => asset,
    ) as Item[];
    setSelectedAssets(uniqBy(allAssets, (asset) => asset));
    let allData: string[] = [];
    uniqBy(allAssets, (asset) => asset.id).forEach((da) => {
      allData = [...allData, JSON.stringify(da)];
    });
    form.setFieldValue('assets', allData);
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys as string[], confirm)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Search
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    render: (text) => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[searchText]}
        autoEscape
        textToHighlight={text ? text.toString() : ''}
      />
    ),
  });

  const cbcColums: ColumnsType<DataType> = [
    {
      title: 'CBC Number',
      dataIndex: 'cbcNumber',
      key: 'cbcNumber',
      ...getColumnSearchProps('cbcNumber'),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_: string, row: object) => {
        const record = row as DataType;
        return (
          <Checkbox
            onChange={() => handleChange(record.cbcNumber)}
            checked={selectedAssets.some((asset) => record.cbcNumber === asset.cbc)}
          />
        );
      },
    },
  ];

  const budgetColumns: ColumnsType<object> = [
    {
      title: 'Asset Category',
      dataIndex: 'assetCategory',
      key: 'assetCategory',
    },
    {
      title: 'Description',
      dataIndex: 'descriptions',
      key: 'descriptions',
      render: (_) => {
        return `${_}`.replaceAll(',', ', ');
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'CBC Numbers',
      dataIndex: 'cbcNumbers',
      key: 'cbcNumbers',
      render: (_: string[]) => {
        let text = '';

        _.forEach((te: string, index: number) => {
          if (index !== 0) {
            text = `${text}, ${te}`;
          } else {
            text = `${te}`;
          }
        });

        return <>{text}</>;
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_: string, row: object) => {
        const record = row as Asset;
        return (
          <CloseOutlined
            onClick={() =>
              setAssets((assets) =>
                assets.filter((asset: Asset) => asset.assetCategory !== record.assetCategory),
              )
            }
          />
        );
      },
    },
  ];

  const onAddClicked = () => {
    if (selectedAssets.length > 0 && form.getFieldValue('assetCategory')) {
      setAssets((assets) =>
        uniqBy(
          [
            {
              assetCategory: form.getFieldValue('assetCategory'),
              quantity: selectedAssets.length,
              cbcNumbers: selectedAssets?.map((asset) => asset.cbc),
              ids: selectedAssets?.map((asset) => asset.id),
              descriptions: selectedAssets[0]?.name,
            },
            ...assets,
          ],
          (asset) => asset.assetCategory,
        ),
      );
    }

    setSelectedAssets([]);
    setCategory('');
    form.setFieldValue('assetCategory', '');
    form.setFieldValue('assets', []);
  };

  const handleResetClick = () => {
    form.resetFields();
    setSelectedAssets([]);
    setAssets([]);
    handleOnClose();
  };

  const handleFormSubmit = async (values: { [name: string]: string }) => {
    const body = {
      userId: user?.id,
      type,
      fromDepartmentId: departments.find((department) => department.name === values.fromLocation)
        ?.id,
      toDepartmentId: departments.find((department) => department.name === values.toLocation)?.id,
      comment,
      createRemoveReqCats: assets?.map((asset) => ({
        catId: assetCategories.find((ac) => ac.name === asset.assetCategory)?.id || 0,
        itemIds: asset.ids,
      })),
    };
    const res = await mutate(body);

    if (res.success) {
      setBRequestId(res.data?.data?.data?.removalRequestId?.name);
      setIsSuccess(true);
      await onAfterSubmit();
      return;
    }

    return message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
  };

  const handleOnClose = () => {
    setVisible(false);
    setAssets([]);
    setCategory('');
    setSelectedAssets([]);
  };
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    form.setFieldValue('toLocation', `Head Office.${type} Warehouse`);
    form.setFieldValue('fromLocation', 'Head Office.Used Warehouse');
  }, [type, visible]);
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  return (
    <>
      <Button className='upload button3' onClick={() => setVisible(true)}>
        Request
      </Button>
      <>
        <ModalComponent
          title='Asset Transfer (Repair / Disposal / Donation)'
          visible={visible}
          onClose={handleOnClose}
          width={isSuccess ? 600 : 800}
        >
          <>
            {isSuccess ? (
              <>
                <ResultsComponent
                  status={'success'}
                  title='Successfully Requested'
                  extra={[
                    <div key={'done'}>
                      {requestId && (
                        <div className='requestNumbersBudget'>
                          <div>
                            Request Number: <span style={{ fontWeight: 900 }}>{requestId}</span>
                          </div>
                        </div>
                      )}
                      <Button className='done-button' key={'done'} onClick={onDoneClick}>
                        Done
                      </Button>
                    </div>,
                  ]}
                />
              </>
            ) : (
              <>
                {loading ? (
                  <Spinner />
                ) : (
                  <div className='RepairTransferModal'>
                    <div className='button-types'>
                      <span className='button-type'>Type:</span>
                      <div className='buttons'>
                        <Button
                          className={`${type === 'Repair' ? 'button-active' : ''}`}
                          onClick={() => setType('Repair')}
                        >
                          Repair
                        </Button>
                        <Button
                          className={`${type === 'Disposal' ? 'button-active' : ''}`}
                          onClick={() => setType('Disposal')}
                        >
                          Disposal
                        </Button>
                        <Button
                          className={`${type === 'Donation' ? 'button-active' : ''}`}
                          onClick={() => setType('Donation')}
                        >
                          Donation
                        </Button>
                      </div>
                    </div>
                    <Form
                      form={form}
                      className='RepairTransferModal_form'
                      onFinish={handleFormSubmit}
                    >
                      <div className='locations'>
                        <Form.Item
                          className='from-location'
                          label='From Location'
                          name='fromLocation'
                          labelCol={{ span: 10 }}
                        >
                          <Input className='readonly-input' readOnly disabled />
                        </Form.Item>
                        {type === 'Repair' ? (
                          <div
                            className='switcher'
                            onClick={() => {
                              if (
                                form.getFieldValue('fromLocation') === 'Head Office.Used Warehouse'
                              ) {
                                form.setFieldValue('fromLocation', `Head Office.${type} Warehouse`);
                                form.setFieldValue('toLocation', 'Head Office.Used Warehouse');
                              } else {
                                form.setFieldValue('toLocation', `Head Office.${type} Warehouse`);
                                form.setFieldValue('fromLocation', 'Head Office.Used Warehouse');
                              }
                            }}
                          >
                            <LeftOutlined style={{ marginLeft: 50 }} />
                            <RightOutlined className='m-auto' />
                          </div>
                        ) : null}
                        <Form.Item
                          className='to-location'
                          label='To Location'
                          name='toLocation'
                          labelCol={{ span: 10 }}
                        >
                          <Input className='readonly-input' readOnly disabled />
                        </Form.Item>
                      </div>
                      <div className='category'>
                        <Form.Item
                          label='Asset Category'
                          name='assetCategory'
                          labelCol={{ span: 6 }}
                          required
                        >
                          <Select
                            showSearch={true}
                            style={{ width: 400 }}
                            placeholder='Select Asset Category'
                            onChange={(e) => {
                              // @ts-ignore
                              setCategory(assetCategories.find((ac) => ac.name === e)?.id || '');
                            }}
                          >
                            {assetCategories?.map((category) => (
                              <Option value={category.name} key={category.id}>
                                {category.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <div className='quantity'>Quantity: {selectedAssets.length}</div>
                      </div>
                      <Form.Item
                        label='Selected Assets'
                        name='assets'
                        className='assets-selection'
                        labelCol={{ span: 5 }}
                      >
                        <Select
                          style={{ width: '100%' }}
                          placeholder='Select Asset Category'
                          mode='multiple'
                          onChange={(e) => {
                            if (e.length > 0) {
                              const data: string[] = JSON.parse(JSON.stringify(e));
                              let allData: Item[] = [];

                              data.forEach((data) => {
                                allData = [...allData, JSON.parse(data)];
                              });
                              setSelectedAssets((assets) =>
                                uniqBy([...assets, ...allData], (asset) => asset?.id),
                              );
                            } else {
                              setSelectedAssets([]);
                            }
                          }}
                        >
                          {items?.map((item) => (
                            <Option value={JSON.stringify(item)} key={item.id}>
                              {item.cbc}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <div className='cbc-section'>
                        <div className='cbc'>
                          <div>Selected CBC</div>
                          <div className='cbc-list'>
                            {selectedAssets?.map((asset) => (
                              <div key={asset.id} className='cbc-item'>
                                {asset.cbc}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button onClick={onAddClicked} className='add-button button'>
                          Add
                        </Button>
                      </div>
                      <div className='cbc-number-table'>
                        {category && (
                          <>
                            <TableComponent
                              data={items?.map((item) => ({
                                cbcNumber: item.cbc,
                                key: item.id,
                              }))}
                              columns={cbcColums as ColumnsType<object>}
                              pagination={{
                                size: 'small',
                                pageSize: 10,
                                showSizeChanger: true,
                              }}
                            />
                          </>
                        )}
                      </div>

                      <div className='asset-table'>
                        {assets.length > 0 && (
                          <>
                            <TableComponent
                              data={assets}
                              columns={budgetColumns}
                              pagination={{
                                size: 'small',
                                pageSize: 10,
                                showSizeChanger: true,
                              }}
                            />
                            <Form.Item
                              name='comment'
                              required
                              rules={[{ required: true, message: 'Please add a comment' }]}
                            >
                              <TextArea
                                rows={5}
                                placeholder='comment'
                                onChange={(e) => setComment(e.target.value)}
                              ></TextArea>
                            </Form.Item>
                            <div className='action-buttons'>
                              <Button
                                className='button5'
                                onClick={handleResetClick}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                              <Button
                                className='button3'
                                htmlType='submit'
                                disabled={loading || assets.length === 0}
                              >
                                Submit
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </Form>
                  </div>
                )}
              </>
            )}
          </>
        </ModalComponent>
      </>
    </>
  );
};

export default RepairTransferModal;
