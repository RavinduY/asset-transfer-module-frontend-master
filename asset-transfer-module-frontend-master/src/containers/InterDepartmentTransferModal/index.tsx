/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useRef, useState } from 'react';
import { uniqBy } from 'lodash';
import ResultsComponent from '@/components/Result';
import { useMutation } from '@/hooks/useMutate';
import { API_ROUTES, HTTP_TYPES, MESSAGES } from '@/utils/constants';
import { Button, Checkbox, Form, Input, InputRef, message, Select, Space } from 'antd';
import ModalComponent from '@/components/Modal';
import { useAppSelector } from '@/hooks/useRedux';
import TableComponent from '@/containers/Table';
import { ColumnsType } from 'antd/lib/table';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';

import './styles.scss';
import { AssetCategorie } from '@/store/asset-category';
import { useQuery } from '@/hooks/useQuery';
import { Item } from '../RepairTransferModal';
import { DataType } from '../TransferRequestModal';
import { ColumnType } from 'antd/es/table';
import Highlighter from 'react-highlight-words';
import { FilterConfirmProps } from 'antd/es/table/interface';

const { Option } = Select;
type DataIndex = keyof DataType;

interface Props {
  onAfterSubmit: () => void;
}

interface Asset {
  assetCategory: string;
  quantity: number;
  cbcNumbers: string[];
}

const InterDepartmentTransferModal: FC<Props> = ({ onAfterSubmit }): JSX.Element => {
  const [form] = Form.useForm();

  const { user } = useAppSelector((store) => store.user);

  const [assetCategories, setAssetCategories] = useState<AssetCategorie[]>([]);
  const { departments } = useAppSelector((store) => store.departments);
  const [fromLocation, setFromLocation] = useState<string | undefined>(user?.department?.name);
  const [toLocation, setToLocation] = useState<string | undefined>(
    user?.department?.miniDepartment,
  );
  const [visible, setVisible] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const [selectedSearch, setSelectedSearch] = useState('PO');
  const [selectedPO, setSelectedPO] = useState<string>();
  const [poNumbers, setPONumbers] = useState<string[]>([]);
  const [selectedManufactorSerial, setSelectedManufactorSerial] = useState<string>();
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const searchInput = useRef<InputRef>(null);
  const [searchText, setSearchText] = useState('');
  const [bRequestId, setBRequestId] = useState('');

  const { mutate, loading } = useMutation({
    url: API_ROUTES.ASSET_TRANSFER.INTER_DEPARTMENT_TRANSFER,
  });

  const onDoneClick = () => {
    setIsSuccess(false);
    setVisible(false);
  };

  useEffect(() => {
    if (selectedCategory && fromLocation) {
      getLocations();
    }
  }, [fromLocation, selectedCategory]);

  const { data: assetCategoryData } = useQuery({
    url: '/asset_category/getCategoryByUserDepId?all=0',
  });

  useEffect(() => {
    if (assetCategoryData && Array.isArray(assetCategoryData)) {
      setAssetCategories(assetCategoryData);
    }
  }, [assetCategoryData]);

  const getLocations = async () => {
    const res = await mutate(
      {},
      HTTP_TYPES.GET,
      {},
      API_ROUTES.ITEMS.ITMES_BY_DEPARTMENT_AND_GATEGORY_FOR_INTER_DEPARTMENT.replace(
        '#{departmentId}',
        `${departments.find((de) => de.name === fromLocation)?.id || 0}`,
      ).replace('#{categoryId}', `${selectedCategory}`),
    );
    if (res.success) {
      setItems(res.data.data);
      const items = res.data.data;
      setPONumbers(
        uniqBy(
          items?.map((request: any) => request?.poNum || []),
          (po) => po,
        ),
      );
      const itemsWithManufactorSerial = items?.filter((it: any) => it?.manufactureSerial);
      setSerialNumbers(
        uniqBy(
          itemsWithManufactorSerial?.map((request: any) => request?.manufactureSerial || []),
          (po) => po,
        ),
      );
    }
  };
  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void) => {
    confirm();
    setSearchText(selectedKeys[0]);
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
      form.setFieldValue('cbcNumber', allData);
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
    form.setFieldValue('cbcNumber', allData);
  };

  const cbcColums: ColumnsType<DataType> = [
    {
      title: 'CBC Number',
      dataIndex: 'cbcNumber',
      key: 'cbcNumber',
      ...getColumnSearchProps('cbcNumber'),
    },
    {
      title: 'GRN No',
      dataIndex: 'assetNumber',
      key: 'assetNumber',
      ...getColumnSearchProps('assetNumber'),
    },
    {
      title: 'Manufacture Serial',
      dataIndex: 'manufactureSerial',
      key: 'manufactureSerial',
      ...getColumnSearchProps('manufactureSerial'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ...getColumnSearchProps('description'),
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
      render: (_: string, row: any) => {
        return (
          <CloseOutlined
            onClick={() =>
              setAssets((assets) => assets.filter((asset: any) => asset.asset !== row.category))
            }
          />
        );
      },
    },
  ];

  const renderItems = () => {
    if (selectedSearch === 'PO' && selectedPO) {
      return items.filter((item) => item.poNum === selectedPO);
    }
    if (selectedSearch === 'Serial Number' && selectedManufactorSerial) {
      return items.filter((item: any) => item.manufactureSerial === selectedManufactorSerial);
    }
    return items;
  };

  const onAddClicked = () => {
    if (selectedAssets.length > 0) {
      setAssets((assets) =>
        uniqBy(
          [
            {
              assetCategory: form.getFieldValue('assetCategory'),
              quantity: selectedAssets.length,
              cbcNumbers: selectedAssets?.map((asset) => asset.cbc),
            },
            ...assets,
          ],
          (asset) => asset.assetCategory,
        ),
      );
    }

    setSelectedAssets([]);
    setPONumbers([]);
    setItems([]);
    form.setFieldValue('assetCategory', '');
    form.setFieldValue('assets', []);
    form.setFieldValue('cbcNumber', []);
    form.setFieldValue('poNumber', '');
  };

  const handleResetClick = () => {
    form.resetFields();
    setSelectedAssets([]);
    setAssets([]);
  };

  const handleFormSubmit = async () => {
    const body = {
      userId: user?.id,
      interRequestId: `${Date.now()}`,
      fromDepartmentId: departments.find((de) => de.name === user?.department.name)?.id || 0,
      toDepartmentId: departments.find((de) => de.name === user?.department.name)?.id || 0,
      selectedData: assets?.map((asset) => ({
        categoryId: assetCategories.find((category) => category?.name === asset.assetCategory)?.id,
        quantity: asset.cbcNumbers?.length,
        cbcs: asset.cbcNumbers,
      })),
    };
    const res = await mutate(body);

    if (res.success) {
      setBRequestId(res.data?.interDepartmentRequestId?.name);
      setIsSuccess(true);
      setAssets([]);
      await onAfterSubmit();
      return;
    }

    return message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
  };

  const handleOnClose = () => {
    setVisible(false);
    setAssets([]);
    setSelectedAssets([]);
    setFromLocation('');
    setToLocation('');
    setPONumbers([]);
    setSerialNumbers([]);
  };

  return (
    <>
      <Button className='upload button3' onClick={() => setVisible(true)}>
        Request
      </Button>
      <>
        <ModalComponent
          title='Mini Stock Transfer'
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
                    <>
                      <div className='requestNumbers'>
                        {bRequestId && (
                          <div className='requestNumbersBudget'>
                            <div>
                              Transfer Request number:{' '}
                              <span style={{ fontWeight: 900 }}>{bRequestId}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button className='done-button' key={'done'} onClick={onDoneClick}>
                        Done
                      </Button>
                    </>,
                  ]}
                />
              </>
            ) : (
              <>
                <Form
                  form={form}
                  className='InterDepartmentTransferModal_form'
                  onFinish={handleFormSubmit}
                >
                  <div className='locations'>
                    <Form.Item
                      className='from-location'
                      label='From Location'
                      name='fromLocation'
                      labelCol={{ span: 10 }}
                    >
                      <Select
                        showSearch={true}
                        style={{ width: 200 }}
                        value='Head Office.Warehouse'
                        placeholder='Head Office.Warehouse'
                        onChange={(e) => setFromLocation(e)}
                        disabled={true}
                      >
                        {departments?.map((department) => (
                          <Option value={department?.name} key={department?.id}>
                            {department?.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      className='to-location'
                      label='To Location'
                      name='toLocation'
                      labelCol={{ span: 10 }}
                      required={false}
                      rules={[{ required: false, message: 'Please Select To Location' }]}
                    >
                      <Select
                        showSearch={true}
                        style={{ width: 200 }}
                        value={toLocation}
                        disabled={true}
                        placeholder={`${
                          user ? user?.department?.miniDepartment : 'Select To Location'
                        }`}
                        onChange={(e) => setToLocation(e)}
                      >
                        {departments?.map((department) => (
                          <Option value={department?.name} key={department?.id}>
                            {department?.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                  <div className='category'>
                    <Form.Item
                      label='Asset Category'
                      name='assetCategory'
                      labelCol={{ span: 6 }}
                      required={false}
                      rules={[{ required: false, message: 'Please Select Asset Category' }]}
                    >
                      <Select
                        style={{ width: 400 }}
                        showSearch={true}
                        placeholder='Select Asset Category'
                        onChange={(e) => {
                          setSelectedCategory(
                            assetCategories.find((category) => category?.name === e)?.id || 0,
                          );
                        }}
                      >
                        {assetCategories?.map((category) => (
                          <Option value={category?.name} key={category?.id}>
                            {category?.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <div className='quantity'>Quantity: {selectedAssets.length}</div>
                  </div>
                  <div className='search'>
                    <Form.Item label='Search By' name='assetCategory' labelCol={{ span: 4 }}>
                      <Button
                        className={`${selectedSearch === 'PO' ? 'active' : ''}`}
                        onClick={() => setSelectedSearch('PO')}
                      >
                        PO
                      </Button>
                      <Button
                        className={`${selectedSearch === 'CBC Number' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedSearch('CBC Number');
                          form.setFieldValue('poNumber', '');
                        }}
                      >
                        CBC Number
                      </Button>
                      <Button
                        className={`${selectedSearch === 'Serial Number' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedSearch('Serial Number');
                          form.setFieldValue('serialNumber', '');
                        }}
                      >
                        Serial Number
                      </Button>
                    </Form.Item>
                  </div>
                  <div className='po-cbc'>
                    <Form.Item
                      className='po-number'
                      label='PO Number'
                      name='poNumber'
                      labelCol={{ span: 10 }}
                    >
                      <Select
                        style={{ width: 200 }}
                        disabled={selectedSearch !== 'PO'}
                        onChange={(e) => setSelectedPO(e)}
                        showSearch={true}
                      >
                        {poNumbers?.map((poNumber) => (
                          <Option key={poNumber} value={poNumber}>
                            {poNumber}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      className='cbc-number'
                      label='CBC Number'
                      name='cbcNumber'
                      labelCol={{ span: 14 }}
                    >
                      <Select
                        disabled={selectedSearch !== 'CBC Number'}
                        style={{ width: 200 }}
                        mode='multiple'
                        showSearch={true}
                        onChange={(e) => {
                          if (e.length > 0) {
                            const data: string[] = JSON.parse(JSON.stringify(e));
                            let allData: Item[] = [];

                            data.forEach((data) => {
                              allData = [...allData, JSON.parse(data)];
                            });

                            setSelectedAssets((assets: any) =>
                              uniqBy([...assets, ...allData], (asset) => asset.id),
                            );
                          } else {
                            setSelectedAssets([]);
                          }
                        }}
                        value={selectedAssets}
                      >
                        {items?.map((item: Item) => (
                          <Option value={JSON.stringify(item)} key={item.id}>
                            {item.cbc}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                  <div>
                    <Form.Item
                      className='po-number'
                      label='Serial Number'
                      name='serialNumber'
                      labelCol={{ span: 4 }}
                    >
                      <Select
                        style={{ width: 200 }}
                        disabled={selectedSearch !== 'Serial Number'}
                        onChange={(e) => setSelectedManufactorSerial(e)}
                        showSearch={true}
                      >
                        {serialNumbers?.map((serialNumber, index) => (
                          <Option key={index} value={serialNumber}>
                            {serialNumber}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                  <div className='cbc-section'>
                    <div className='cbc'>
                      <div>Selected Assets</div>
                      <div className='cbc-list'>
                        {selectedAssets?.map((asset) => (
                          <div key={asset.id} className='cbc-item'>
                            {asset.cbc}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      disabled={selectedAssets?.length === 0}
                      onClick={onAddClicked}
                      className='add-button button'
                    >
                      Add
                    </Button>
                  </div>
                  <div className='cbc-number-table'>
                    {selectedCategory && (
                      <>
                        <TableComponent
                          data={renderItems()?.map((item) => ({
                            cbcNumber: item.cbc,
                            assetNumber: item.grnNum,
                            description: item.name,
                            manufactureSerial: item.manufactureSerial || '',
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
                        <div className='action-buttons'>
                          <Button onClick={handleResetClick} disabled={loading}>
                            Cancel
                          </Button>
                          <Button htmlType='submit' disabled={loading || assets.length === 0}>
                            Submit
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </Form>
              </>
            )}
          </>
        </ModalComponent>
      </>
    </>
  );
};

export default InterDepartmentTransferModal;
