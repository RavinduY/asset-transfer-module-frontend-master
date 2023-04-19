/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { Col, Form, Radio, Row, Select, Table, Tag } from 'antd';
import TableComponent from '@/containers/Table';
import { ColumnsType } from 'antd/es/table';
import { useQuery } from '@/hooks/useQuery';
import { API_ROUTES } from '@/utils/constants';
import { isEmpty, uniqBy } from 'lodash';

type SearchByType = boolean | 'PO';

const columns: ColumnsType<object> = [
  {
    title: 'CBC Number',
    dataIndex: 'cbc',
    key: 'cbc',
  },
  Table.SELECTION_COLUMN,
];

interface Props {
  assetData: any;
  setFormData: (body: object) => void;
  formData: any;
  setSubmitDisabled: (status: boolean) => void;
  submitDisabled: boolean;
  setDisableCategories: any;
}

const AssetRequestForm: FC<Props> = ({
  assetData,
  setFormData,
  formData,
  setSubmitDisabled,
  setDisableCategories,
}) => {
  const { data } = useQuery({
    url: `${API_ROUTES.ASSIGN_ASSET.GET_ITEMS}?categoryId=${assetData?.catId}`,
  });

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const poNumbers = data?.map((da) => da.poNum);
      setItems(data);
      setPoNumbers(uniqBy(poNumbers, (po) => po));
    }
  }, [data]);

  const [form] = Form.useForm();
  const [searchByType, setSearchByType] = useState<SearchByType>('PO');

  const [isPoInputDisabled, setIsPoInputDisabled] = useState(false);
  const [isCbcInputDisabled, setIsCbcInputDisabled] = useState(true);
  const [selectedPoNumber, setSelectedPoNumber] = useState('');
  const [selectedCbcNumbers, setSelectedCbcNumbers] = useState<string[]>([]);

  const [poNumbers, setPoNumbers] = useState<string[]>([]);

  const onSearchByTypeChange = ({ searchByValue: value }: { searchByValue: SearchByType }) => {
    setSearchByType(value);
    if (value === 'PO') {
      setIsCbcInputDisabled(true);
      setIsPoInputDisabled(false);
      setSelectedCbcNumbers([]);
      return;
    }
    setIsPoInputDisabled(true);
    setIsCbcInputDisabled(false);
    setSelectedPoNumber('');
  };

  const onPoNumberChange = (value: string) => {
    setSelectedPoNumber(value);
    setSelectedCbcNumbers([]);
  };

  const renderPONumbers = poNumbers?.map((poNumber) => (
    <Select.Option key={poNumber}>{poNumber}</Select.Option>
  ));

  const buttonDisabled = () => {
    const datas = formData?.find((data: any) => data?.id === assetData?.id);
    if (datas) {
      const status = datas?.items?.length + assetData?.items?.length > assetData.quantity || false;
      if (status) {
        setDisableCategories((categories: any) => {
          return uniqBy(
            [
              ...categories,
              {
                requested: assetData.quantity,
                category: assetData.categoryName,
                assigned: datas?.items?.length + assetData?.items?.length,
              },
            ].filter((value) => !isEmpty(value)),
            (value) => value?.categoryName,
          );
        });
      } else {
        setDisableCategories((categories: any) => {
          return uniqBy(
            [
              ...categories.filter((category: any) => category.category !== assetData.categoryName),
            ].filter((value) => !isEmpty(value)),
            (value) => value?.categoryName,
          );
        });
      }
      return setSubmitDisabled(status);
    }
    return setSubmitDisabled(true);
  };

  useEffect(() => {
    buttonDisabled();
  }, [formData]);

  const onCbcNumbersChange = (cbcNumbers: string[]) => {
    setSelectedCbcNumbers(cbcNumbers);
    setFormData((prevItems: any) => {
      const data: any = uniqBy(
        [
          {
            id: assetData?.id,
            items: cbcNumbers?.map((cbc) => ({
              id: items.find((item: any) => item?.cbc === cbc)?.id,
            })),
          },
          ...prevItems,
        ],
        (item) => item?.id,
      );
      return data?.filter((item: any) => item?.items?.length > 0);
    });
  };

  const cbcNumbers = items?.map((item: any) => (
    <Select.Option key={item.id} value={item.cbc}>
      {item.cbc}
    </Select.Option>
  ));

  const selectedCbcNumberTags = selectedCbcNumbers?.map((cbc) => (
    <Tag className='selected-cbc-numbers' key={cbc} color='default'>
      {cbc}
    </Tag>
  ));

  const rowSelection = {
    columnTitle: 'Transfer',
    onChange: (_selectedRowKeys: React.Key[], selectedRows: any[]) => {
      const cbcNumbers = selectedRows.map((row) => row?.cbc);
      setSelectedCbcNumbers(cbcNumbers);
      buttonDisabled();
      setFormData((prevItems: any) => {
        const data: any = uniqBy(
          [
            {
              id: assetData?.id,
              items: cbcNumbers?.map((cbc) => ({
                id: items.find((item: any) => item?.cbc === cbc)?.id,
              })),
            },
            ...prevItems,
          ],
          (item) => item?.id,
        );
        return data?.filter((item: any) => item?.items?.length > 0);
      });
    },
  };

  const getItems = () => {
    return items
      .filter((item) => item.poNum === selectedPoNumber)
      .map((item: any, key: number) => ({
        ...item,
        key,
      }));
  };

  return (
    <Form
      form={form}
      layout='horizontal'
      initialValues={{ searchByValue: searchByType }}
      onValuesChange={onSearchByTypeChange}
    >
      <Form.Item label='Search By' name='searchByValue'>
        <Radio.Group buttonStyle='solid'>
          <Radio.Button value='PO'>PO</Radio.Button>
          <Radio.Button value='CbcNumber'>CBC Number</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Row>
        <Col xs={24} xl={10}>
          <Form.Item label='PO Number'>
            <Select
              showSearch={true}
              allowClear
              placeholder='Select a PO number'
              optionFilterProp='children'
              onChange={onPoNumberChange}
              disabled={isPoInputDisabled}
            >
              {renderPONumbers}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} xl={1}></Col>
        <Col xs={24} xl={13}>
          <Form.Item label='CBC Numbers'>
            <Select
              mode='multiple'
              allowClear
              placeholder='Select CBC Numbers'
              onChange={onCbcNumbersChange}
              disabled={isCbcInputDisabled}
            >
              {cbcNumbers}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      {(selectedPoNumber || selectedCbcNumbers.length > 0) && (
        <>
          <Row>
            <Col>
              <Form.Item label='Selected CBC'>
                {selectedCbcNumbers.length > 0 && (
                  <>
                    {selectedCbcNumberTags}
                    <div>
                      Select CBC Numbers to transfer (Selected
                      {` ${selectedCbcNumbers.length}`})
                    </div>
                  </>
                )}
                {selectedCbcNumbers.length === 0 && (
                  <div>Select CBC Numbers to transfer (Selected 0)</div>
                )}
              </Form.Item>
            </Col>
          </Row>
          {selectedPoNumber && (
            <Row>
              <Col xs={24} xl={3}></Col>
              <Col xs={24} xl={14}>
                <TableComponent
                  columns={columns}
                  data={getItems()}
                  rowSelection={{
                    ...rowSelection,
                  }}
                />
              </Col>
            </Row>
          )}
        </>
      )}
    </Form>
  );
};

export default AssetRequestForm;
