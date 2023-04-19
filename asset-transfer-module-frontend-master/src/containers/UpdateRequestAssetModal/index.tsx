/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';

import ModalComponent from '@/components/Modal';
import ResultsComponent from '@/components/Result';
import { useMutation } from '@/hooks/useMutate';
import { API_ROUTES, HTTP_TYPES, MESSAGES } from '@/utils/constants';
import { Button, Form, InputNumber, message } from 'antd';
import { useAppSelector } from '@/hooks/useRedux';

import './styles.scss';
import { AssetRequest, RequestItem } from '@/pages/AssertRequestPage';

interface Props {
  onAfterSubmit: (input: AssetRequest) => void;
  assetRequest: AssetRequest;
}

const UpdateRequestAssetModal: FC<Props> = ({ onAfterSubmit, assetRequest }): JSX.Element => {
  const [form] = Form.useForm();
  const { user } = useAppSelector((store) => store.user);

  const [visible, setVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [assetRequestData, setAssetRequestData] = useState(assetRequest);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.ASSET_REQUEST.UPDATE_QUANTITY,
  });

  const onDoneClick = () => {
    setIsSuccess(false);
    handleCancelClick();
  };

  const handleSubmit = async () => {
    const body = {
      id: assetRequest.id,
      reqItems: assetRequestData.requestItems.map((item: RequestItem) => {
        return {
          id: item.id,
          quantity: item.quantity,
        };
      }),
    };
    const res = await mutate(body, HTTP_TYPES.PUT);
    if (res.success) {
      setIsSuccess(true);
      onAfterSubmit(assetRequestData);
      return;
    } else {
      message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
      return;
    }
  };

  const handleCancelClick = () => {
    setVisible(false);
    form.resetFields();
  };

  const handleQuantityChange = (quantity: number, requestItemId: number) => {
    setAssetRequestData({
      ...assetRequestData,
      requestItems: assetRequestData.requestItems.map((item: RequestItem) => {
        if (item.id === requestItemId) {
          return {
            ...item,
            quantity,
          };
        } else {
          return item;
        }
      }),
    });
  };

  return (
    <>
      <Button className='request button3' onClick={() => setVisible(true)}>
        Edit
      </Button>
      <>
        <ModalComponent
          title='Asset Request Update'
          visible={visible}
          onClose={handleCancelClick}
          width={isSuccess ? 600 : 1000}
        >
          <div className='RequestAssetModal'>
            {isSuccess ? (
              <>
                <ResultsComponent
                  status={'success'}
                  title='Successfully Updated the Asset Request'
                  extra={[
                    <div key={'done'}>
                      {/* <div className='requestNumbers'>
                      </div> */}
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
                {
                  <Form form={form}>
                    <div className='user-branch'>
                      <Form.Item label='Initiator' name='initiator'>
                        <div className='user'>{user?.userName}</div>
                      </Form.Item>
                      <Form.Item label='Location' name='location' className='branch'>
                        <div>{user?.branch?.name}</div>
                      </Form.Item>
                    </div>
                    {assetRequestData?.requestItems?.map((requestItem: RequestItem) => (
                      <div className='category-quantity' key={requestItem.id}>
                        <Form.Item className='category' label='Asset Category' name='category'>
                          <div>{requestItem.categoryName}</div>
                        </Form.Item>
                        <Form.Item className='quantity' label='Quantity' name='quantity' required>
                          <InputNumber
                            style={{ width: 50 }}
                            stringMode={false}
                            defaultValue={requestItem.quantity}
                            onChange={(e: number) => handleQuantityChange(e, requestItem.id)}
                            min={1}
                          />
                        </Form.Item>
                      </div>
                    ))}

                    <div className='action-buttons'>
                      <Button className='button5' disabled={loading} onClick={handleCancelClick}>
                        Cancel
                      </Button>
                      <Button className='button' disabled={loading} onClick={handleSubmit}>
                        Submit
                      </Button>
                    </div>
                  </Form>
                }
              </>
            )}
          </div>
        </ModalComponent>
      </>
    </>
  );
};

export default UpdateRequestAssetModal;
