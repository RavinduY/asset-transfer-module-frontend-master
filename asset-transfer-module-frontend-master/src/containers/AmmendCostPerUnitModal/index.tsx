import { FC, useState } from 'react';
import { Button, Form, InputNumber, message, Select } from 'antd';
import ModalComponent from '@/components/Modal';
import { useAppSelector } from '@/hooks/useRedux';
import { useMutation } from '@/hooks/useMutate';
import { API_ROUTES, MESSAGES } from '@/utils/constants';

import './styles.scss';

const { Option } = Select;

interface Props {
  onAfterSubmit: () => void;
}

const AmendCostPerUnitModal: FC<Props> = ({ onAfterSubmit }): JSX.Element => {
  const [form] = Form.useForm();
  const { assetCategories } = useAppSelector((store) => store.assetCategory);

  const [visible, setVisible] = useState(false);
  const [isSuccess] = useState(false);
  const [assetCategory, setAssetCategory] = useState<string | null>(null);
  const [costPerUnit, setCostPerUnit] = useState(0);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.COST_PER_UNIT.CREATE,
  });

  const resetValues = () => {
    setAssetCategory('');
    setCostPerUnit(0);
  };

  const onSubmit = async () => {
    const res = await mutate({
      name: assetCategory,
      revicedCost: parseFloat(`${costPerUnit}`),
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
      <Button className='amend button4' onClick={() => setVisible(true)}>
        Amend
      </Button>
      <ModalComponent
        visible={visible}
        onClose={() => setVisible(false)}
        title='Amend Unit Cost'
        width={isSuccess ? 600 : 800}
      >
        <div className='BudgetUploadModal'>
          {isSuccess ? (
            ''
          ) : (
            <Form onFinish={onSubmit} form={form}>
              <Form.Item
                label='Select Asset Category'
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
              <Form.Item
                label='Cost Per Unit (Rs)'
                name='quantity'
                labelCol={{ span: 5 }}
                required
                rules={[{ required: true, message: 'Please add cost per unit' }]}
              >
                <InputNumber
                  style={{ width: 500 }}
                  placeholder='cost per unit'
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e)}
                  stringMode={true}
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

export default AmendCostPerUnitModal;
