/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useEffect, useRef, useState } from 'react';
import { ColumnType } from 'antd/es/table';
import { FilterConfirmProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { uniqBy } from 'lodash';
import ResultsComponent from '@/components/Result';
import { useMutation } from '@/hooks/useMutate';
import { API_ROUTES, MESSAGES } from '@/utils/constants';
import { Alert, Button, Checkbox, Form, Input, InputRef, message, Select, Space } from 'antd';
import ModalComponent from '@/components/Modal';
import { useAppSelector } from '@/hooks/useRedux';
import TableComponent from '@/containers/Table';
import { ColumnsType } from 'antd/lib/table';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { Item } from '@/containers/RepairTransferModal';
import { useQuery } from '@/hooks/useQuery';
import { v4 as uuid } from 'uuid';

import './styles.scss';
import { AssetCategorie } from '@/store/asset-category';

const { Option } = Select;

interface Asset {
  assetCategory: string;
  quantity: number;
  cbcNumbers: string[];
}

export interface DataType {
  key: string;
  cbcNumber: string;
  assetNumber: string;
  manufactureSerial: string;
  description: string;
  action: string;
}

type DataIndex = keyof DataType;

type RequestType = 'New' | 'Used' | 'Remove';

interface Props {
  onAfterSubmit: () => void;
}

const TransferRequestModal: FC<Props> = ({ onAfterSubmit }): JSX.Element => {
  const [form] = Form.useForm();

  const { user } = useAppSelector((store) => store.user);
  const { budgetTypes } = useAppSelector((store) => store.budgetTypes);
  const { branches } = useAppSelector((store) => store.branch);
  const { departments } = useAppSelector((store) => store.departments);
  const { buildings } = useAppSelector((store) => store.buildings);
  const { floors } = useAppSelector((store) => store.floors);

  const [assetCategories, setAssetCategories] = useState<AssetCategorie[]>([]);
  const [type, setType] = useState<RequestType>('New');
  const [requestId, setRequestId] = useState(uuid());
  const [budgetType, setBudgetType] = useState(null);
  const [visible, setVisible] = useState(false);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Item[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [category, setCategory] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('PO');
  const [poNumbers, setPONumbers] = useState<string[]>([]);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [selectedPO, setSelectedPO] = useState<string>();
  const [selectedManufactorSerial, setSelectedManufactorSerial] = useState<string>();
  const [items, setItems] = useState<Item[]>([]);
  const [toDepartmentId, setToDepartmentId] = useState<string | null>(null);
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [remaning, setRemaning] = useState<number | null>(null);
  const [bRequestId, setBRequestId] = useState('');

  const { data: assetCategoryData } = useQuery({
    url: '/asset_category/getCategoryByUserDepId?all=0',
  });

  useEffect(() => {
    if (assetCategoryData && Array.isArray(assetCategoryData)) {
      setAssetCategories(assetCategoryData);
    }
  }, [assetCategoryData]);

  const url = `${API_ROUTES.ASSET_TRANSFER.GET_ITEMS.replace(
    '#{categoryId}',
    `${categoryId}`,
  ).replace('#{type}', type)}`;

  const { data, retry } = useQuery({
    // url: branchId ? `${url}&branchId=${branchId}` : `${url}&departmentId=${departmentId}`,
    url:
      type === 'New'
        ? `${url}&branchId=${
            branches.find((branch) => branch.name === branchId)?.id || null
          }&budgetTypeId=${budgetType}&departmentId=${user?.department?.id}`
        : `${url}&branchId=${
            branches.find((branch) => branch.name === branchId)?.id || null
          }&budgetTypeId=0`,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    setRequestId(uuid());
    setCategory('');
    setBudgetType(null);
    setCategoryId(null);
    setBranchId(null);
    setDepartmentId(null);
    setSelectedAssets([]);
    setAssets([]);
    setSelectedPO('');
    setSelectedManufactorSerial('');
    setPONumbers([]);
    setSerialNumbers([]);
    setRemaning(null);
    setItems([]);
    form.resetFields();

    if (type !== 'Remove') {
      form.setFieldValue(
        'fromLocation',
        type === 'New' ? user?.department?.miniDepartment : 'Head Office.Used Warehouse',
      );
      setDepartmentId(
        type === 'New'
          ? departments.find((department) => department.name === 'Head Office.Warehouse')?.name ||
              null
          : departments.find((department) => department.name === 'Head Office.Used Warehouse')
              ?.name || null,
      );
      form.setFieldValue('toLocation', '');
    } else {
      form.setFieldValue('fromLocation', '');
      form.setFieldValue('toLocation', 'Head Office.Used Warehouse');
    }
  }, [type, visible]);

  useEffect(() => {
    setSelectedPO('');
    setSelectedManufactorSerial('');
    setSelectedAssets([]);
    form.setFieldValue('cbcNumber', []);
    setItems([]);
    setAssets([]);
    setRemaning(null);
  }, [type]);

  useEffect(() => {
    setRemaning(null);
    if (categoryId && branchId) {
      if (type === 'Remove') {
        setItems([]);
        retry();
        setSelectedPO(undefined);
        setSelectedManufactorSerial(undefined);
        setPONumbers([]);
        setSerialNumbers([]);
        form.setFieldValue('poNumber', []);
        form.setFieldValue('serialNumber', []);
      } else if (type === 'Used') {
        setItems([]);
        retry();
        setSelectedPO(undefined);
        setSelectedManufactorSerial(undefined);
        setPONumbers([]);
        setSerialNumbers([]);
        form.setFieldValue('poNumber', []);
        form.setFieldValue('serialNumber', []);
      } else {
        if (budgetType) {
          setItems([]);
          retry();
          setSelectedPO(undefined);
          setSelectedManufactorSerial(undefined);
          setPONumbers([]);
          setSerialNumbers([]);
          form.setFieldValue('poNumber', []);
          form.setFieldValue('serialNumber', []);
        }
      }
    }
  }, [categoryId, budgetType, branchId]);

  useEffect(() => {
    const items: any = data;
    setRemaning(items?.remainQuantity);
    if (data && items.itemFiltered && Array.isArray(items.itemFiltered)) {
      setItems(items.itemFiltered);
      setPONumbers(
        uniqBy(
          items.itemFiltered?.map((request: any) => request?.poNum || []),
          (po) => po,
        ),
      );
      const itemsWithManufactorSerial = items?.itemFiltered?.filter(
        (it: any) => it?.manufactureSerial,
      );
      setSerialNumbers(
        uniqBy(
          itemsWithManufactorSerial?.map((request: any) => request?.manufactureSerial || []),
          (po) => po,
        ),
      );
    }
  }, [data]);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.ASSET_TRANSFER.ASSET_TRANSFER_REQUEST,
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
    // if (selectedAssets.length > remaning) {
    //   message.error(`Remaining Count is ${remaning}`);
    //   return;
    // }

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
    setCategory('');
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
    handleOnClose();
  };
  const handleFormSubmit = async (values: { [name: string]: string }) => {
    const body = {
      buildingId: buildings.find((bu) => bu.name === building)?.id || 0,
      floorId: floors.find((fo) => fo.name === floor)?.id || 0,
      userId: user?.id,
      type,
      budgetTypeId: values?.budgetType,
      fromBranchId:
        type == 'Remove'
          ? branches.find((branch) => branch.name === branchId)?.id || null
          : branches.find((branch) => branch.name === values.fromLocation)?.id || null,
      toBranchId: branches.find((branch) => branch.name === branchId)?.id || null,
      fromDepartmentId: departments.find((de) => de.name === departmentId)?.id || null,
      toDepartmentId:
        type == 'Remove'
          ? departments.find((branch) => branch.name === values.toLocation)?.id || null
          : toDepartmentId || null,
      transferReqNumber: Date.now(),
      assetTransferItems: assets?.map((asset) => ({
        categoryId: assetCategories.find(
          (assetCategory) => asset.assetCategory === assetCategory.name,
        )?.id,
        cbcs: asset.cbcNumbers,
        quantity: asset.quantity,
      })),
    };
    if (type === 'Remove' && body.toBranchId) {
      // @ts-ignore
      delete body.toBranchId;
    }
    const res = await mutate(body);

    if (res.success) {
      setBRequestId(res.data?.data?.assetTransferRequestId?.name);
      setTimeout(() => {
        setIsSuccess(true);
      }, 200);

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

  const searchInput = useRef<InputRef>(null);

  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  return (
    <div>
      <Button
        className='button3'
        style={{ color: 'white', height: 35 }}
        onClick={() => setVisible(true)}
      >
        Request
      </Button>
      <>
        <ModalComponent
          title='Asset Transfer (New / Used / Remove)'
          visible={visible}
          onClose={handleOnClose}
          width={isSuccess ? 600 : 800}
        >
          <>
            {isSuccess ? (
              <div key='done2'>
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
              </div>
            ) : (
              <div className='TransferRequestModal' key={requestId}>
                <Form form={form} className='TransferRequestModal_form' onFinish={handleFormSubmit}>
                  <div className='button-types'>
                    <span className='button-type'>Type:</span>
                    <div className='buttons'>
                      <Button
                        className={`${type === 'New' ? 'button-active' : ''}`}
                        onClick={() => setType('New')}
                      >
                        New
                      </Button>
                      <Button
                        className={`${type === 'Remove' ? 'button-active' : ''}`}
                        onClick={() => setType('Remove')}
                      >
                        Remove
                      </Button>
                      <Button
                        className={`${type === 'Used' ? 'button-active' : ''}`}
                        onClick={() => setType('Used')}
                      >
                        Used
                      </Button>
                    </div>
                    <div className='budget-type'>
                      {type === 'New' && (
                        <Form.Item
                          label='Budget Type'
                          name='budgetType'
                          required
                          rules={[{ required: true, message: 'Please select a Budget Type' }]}
                        >
                          <Select
                            style={{ width: 150 }}
                            onChange={(e) => {
                              setBudgetType(e);
                            }}
                          >
                            {budgetTypes
                              ?.filter(
                                (budgetType) => budgetType.name.toLocaleLowerCase() !== 'branch',
                              )
                              ?.map((budgetType) => (
                                <Option key={budgetType.id} value={budgetType.id}>
                                  {budgetType.name}
                                </Option>
                              ))}
                          </Select>
                        </Form.Item>
                      )}
                    </div>
                  </div>

                  <div className='locations'>
                    <Form.Item
                      className='from-location'
                      label='From Location'
                      name='fromLocation'
                      labelCol={{ span: 10 }}
                      required
                    >
                      <Select
                        showSearch={true}
                        value={type === 'Remove' ? branchId : departmentId}
                        disabled={type !== 'Remove'}
                        style={{ width: 200 }}
                        onChange={(e) => {
                          if (type === 'Remove') {
                            setDepartmentId(null);
                            setBranchId(e);
                          } else {
                            setDepartmentId(e);
                            setBranchId(null);
                          }
                        }}
                      >
                        {type === 'Remove'
                          ? branches?.map((branch) => (
                              <Option key={branch.id} value={branch.name}>
                                {branch.name}
                              </Option>
                            ))
                          : departments?.map((department) => (
                              <Option key={department.id} value={department.name}>
                                {department.name}
                              </Option>
                            ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      className='to-location'
                      label='To Location'
                      name='toLocation'
                      labelCol={{ span: 10 }}
                      required
                      rules={[{ required: true, message: 'Please select a Location' }]}
                    >
                      <Select
                        showSearch={true}
                        disabled={type === 'Remove'}
                        style={{ width: 200 }}
                        value={type !== 'Remove' ? branchId : departmentId}
                        onChange={(e) => {
                          setAssets([]);
                          if (type !== 'Remove') {
                            setToDepartmentId(null);
                            setBranchId(e);
                          } else {
                            setBranchId(e);
                          }
                        }}
                      >
                        {type !== 'Remove'
                          ? branches?.map((branch) => (
                              <Option key={branch.id} value={branch.name}>
                                {branch.name}
                              </Option>
                            ))
                          : departments?.map((department) => (
                              <Option key={department.id} value={department.name}>
                                {department.name}
                              </Option>
                            ))}
                      </Select>
                    </Form.Item>
                  </div>
                  <div className='locations'>
                    <Form.Item
                      className='category'
                      label='Building'
                      name='building'
                      required
                      rules={[{ required: true, message: 'Please select a Building' }]}
                    >
                      <Select
                        style={{ width: 280 }}
                        placeholder='Building'
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
                    </Form.Item>
                  </div>
                  <div className='category'>
                    <Form.Item label='Asset Category' name='assetCategory' labelCol={{ span: 6 }}>
                      <Select
                        showSearch={true}
                        style={{ width: 400 }}
                        placeholder='Select Asset Category'
                        onChange={(e) => {
                          setCategory(e);
                          setCategoryId(
                            assetCategories.find((category) => category.name === e)?.id || 0,
                          );
                          form.setFieldValue('cbcNumber', []);
                          setSelectedAssets([]);
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

                            setSelectedAssets((assets) =>
                              uniqBy([...assets, ...allData], (asset) => asset.id),
                            );
                          } else {
                            setSelectedAssets([]);
                          }
                        }}
                        value={selectedAssets}
                      >
                        {items?.map((item) => (
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
                  {type === 'New' &&
                  typeof remaning === 'number' &&
                  remaning < selectedAssets.length ? (
                    <Alert
                      message={`Exceed ${
                        budgetType ? budgetTypes.find((bt) => bt.id === budgetType)?.name || '' : ''
                      } Budget`}
                      description={`${branchId} ${
                        assetCategories.find((ca) => ca.id === categoryId)?.name || ''
                      } ${
                        budgetType ? budgetTypes.find((bt) => bt.id === budgetType)?.name || '' : ''
                      } budget quantity is only ${remaning}`}
                      type='error'
                      showIcon
                    />
                  ) : null}
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
                      disabled={
                        type === 'New' &&
                        typeof remaning === 'number' &&
                        remaning < selectedAssets.length
                      }
                      onClick={onAddClicked}
                      className='add-button button'
                    >
                      Add
                    </Button>
                  </div>
                  <div className='cbc-number-table'>
                    {category && (
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
                          <Button className='button5' onClick={handleResetClick} disabled={loading}>
                            Cancel
                          </Button>
                          <Button
                            className='button3'
                            htmlType='submit'
                            disabled={
                              loading ||
                              assets.length === 0 ||
                              (type === 'New' &&
                                typeof remaning === 'number' &&
                                remaning < selectedAssets.length)
                            }
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
        </ModalComponent>
      </>
    </div>
  );
};

export default TransferRequestModal;
