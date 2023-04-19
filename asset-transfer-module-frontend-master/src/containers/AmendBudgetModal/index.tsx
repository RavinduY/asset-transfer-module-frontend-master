import { FC, useState } from 'react';
import { Button, DatePicker, Form, Input, message, Select } from 'antd';
import ModalComponent from '@/components/Modal';
import { useAppSelector } from '@/hooks/useRedux';
import { useMutation } from '@/hooks/useMutate';
import { API_ROUTES, MESSAGES } from '@/utils/constants';
import moment from 'moment';

import './styles.scss';

const { Option } = Select;

interface Props {
  onAfterSubmit: () => void;
}

const AmendBudgetModal: FC<Props> = ({ onAfterSubmit }): JSX.Element => {
  const [form] = Form.useForm();
  const { branches } = useAppSelector((store) => store.branch);
  const { assetCategories } = useAppSelector((store) => store.assetCategory);

  const [year, setYear] = useState<moment.Moment>(moment(new Date()));
  const [visible, setVisible] = useState(false);
  const [isSuccess] = useState(false);
  const [budgetType, setBudgetType] = useState('');
  const [branch, setBranch] = useState<string | null>(null);
  const [assetCategory, setAssetCategory] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [budgetTypes] = useState(['Branch', 'General', 'Specific']);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.BUDGET.CREATE,
  });

  const resetValues = () => {
    setAssetCategory('');
    setQuantity(0);
    setBranch('');
    setBudgetType('');
  };

  const onSubmit = async () => {
    const res = await mutate({
      branch,
      assetCategory,
      budgetType,
      quantity,
      year: moment(year).format('YYYY'),
    });
    if (res.success) {
      message.success('Budget Amended successfully');
      resetValues();
      setVisible(false);
      form.resetFields();
      await onAfterSubmit();
      return;
    }
    message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
  };

  return (
    <>
      <Button className='button4' onClick={() => setVisible(true)}>
        Amend
      </Button>
      <ModalComponent
        visible={visible}
        onClose={() => setVisible(false)}
        title='Amend Budget'
        width={isSuccess ? 600 : 800}
      >
        <div className='BudgetUploadModal'>
          {isSuccess ? (
            ''
          ) : (
            <Form onFinish={onSubmit} form={form}>
              <Form.Item
                label='Select Year'
                name='year'
                labelCol={{ span: 5 }}
                required
                rules={[{ required: true, message: 'Please select a year' }]}
              >
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
              </Form.Item>
              <Form.Item
                label='Select Budget Type'
                name='budgetType'
                labelCol={{ span: 5 }}
                required
                rules={[{ required: true, message: 'Please select a budget type' }]}
              >
                <Select
                  style={{ width: 500 }}
                  onChange={(e) => setBudgetType(e)}
                  placeholder='Budget Type'
                  showSearch={true}
                >
                  {budgetTypes?.map((type) => (
                    <Option value={type} key={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {budgetType !== 'General' && (
                <Form.Item
                  label='Branch'
                  name='branch'
                  labelCol={{ span: 5 }}
                  required
                  rules={[{ required: true, message: 'Please select a branch' }]}
                >
                  <Select
                    style={{ width: 500 }}
                    onChange={(e) => setBranch(e)}
                    placeholder='Branch'
                    value={branch}
                    showSearch={true}
                  >
                    {branches?.map((branch) => (
                      <Option key={branch.id} value={branch.name}>
                        {branch.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              <div className='category-search'>
                <Form.Item
                  label='Asset Category'
                  name='category'
                  labelCol={{ span: 5 }}
                  required
                  rules={[{ required: true, message: 'Please select a asset category' }]}
                >
                  <Select
                    style={{ width: 500 }}
                    onChange={(e) => setAssetCategory(e)}
                    placeholder='Category'
                    value={assetCategory}
                    showSearch={true}
                  >
                    {assetCategories?.map((assetCategory) => (
                      <Option key={assetCategory.id} value={assetCategory.name}>
                        {assetCategory.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                {/* <Button className='search-button button2'>Search</Button> */}
              </div>

              <Form.Item
                label='Quantity'
                name='quantity'
                labelCol={{ span: 5 }}
                required
                rules={[{ required: true, message: 'Please add a quantity' }]}
              >
                <Input
                  style={{ width: 500 }}
                  type='number'
                  placeholder='Quantity'
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
              </Form.Item>
              <Button className='save-button button3' htmlType='submit' disabled={loading}>
                Save
              </Button>
            </Form>
          )}
        </div>
      </ModalComponent>
    </>
  );
};

export default AmendBudgetModal;
