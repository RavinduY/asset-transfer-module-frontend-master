/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, Button, Col, message, Row } from 'antd';
import { FC, useEffect, useState } from 'react';
import CollapseComponent from '@/components/Collapse';
import ModalComponent from '@/components/Modal';
import ResultsComponent from '@/components/Result';
import AssetRequestForm from '@/components/AssetRequestForm';
import { useMutation } from '@/hooks/useMutate';
import { API_ROUTES, MESSAGES } from '@/utils/constants';
import { useAppSelector } from '@/hooks/useRedux';
import Spinner from '@/components/Spinner';
import DownloadGatePass from '@/components/GatePass/DownloadGatepass';

import './styles.scss';

interface Props {
  show: boolean;
  close: VoidFunction;
  assetData: any;
  onAfterSubmit: () => void;
}

export interface AssetItemDetails {
  requestNumber: string;
  budgetType: string;
  requestor: string;
  location: string;
  requestedItems: Item[];
  id: number;
}

interface Item {
  quantity: number;
  categoryName: string;
}
interface CbcNumberDetails {
  value: string;
}

const AssignAssetModal: FC<Props> = ({ show, close, assetData, onAfterSubmit }): JSX.Element => {
  const { user } = useAppSelector((store) => store.user);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars
  const [selectedCbcNumbers, setSelectedCbcNumbers] = useState<CbcNumberDetails[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [id, setId] = useState(null);
  const [downloadGatepass, setDownloadGatepass] = useState(false);

  const [disableCategories, setDisableCategories] = useState<any[]>([]);

  const [submitDisabled, setSubmitDisabled] = useState(true);

  const [formData, setFormData] = useState<any>([]);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.ASSIGN_ASSET.ASSIGN,
  });

  useEffect(() => {
    if (assetData?.requestItems && Array.isArray(assetData?.requestItems)) {
      setItems(
        assetData?.requestItems?.map((item: any) => ({
          ...item,
        })),
      );
    }
  }, [assetData?.requestItems]);

  const onSubmitClick = async () => {
    try {
      const res = await mutate({
        userId: user?.id,
        requestId: assetData?.id,
        requestItems: formData,
      });
      if (res.success) {
        setIsSuccess(true);
        setSelectedCbcNumbers([]);
        onAfterSubmit();
        setId(res?.data?.data?.id);
        return;
      }
      message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
    } catch (err) {
      return err;
    }
  };

  const onDoneClick = () => {
    setIsSuccess(false);
    close();
  };

  const handleOnClose = () => {
    close();
  };

  return (
    <>
      {downloadGatepass && id && (
        <DownloadGatePass
          url={API_ROUTES.GATEPASS.ASSIGN_ASSET?.replace('#{id}', id)}
          visible={true}
          onAfterDownload={() => {
            setDownloadGatepass(false);
            onDoneClick();
          }}
          autoDownload={true}
        />
      )}
      <div className='AssignAssetModal'>
        <ModalComponent
          visible={show}
          onClose={handleOnClose}
          title='Asset Transfer Against Requisitions (by Branch/Department)'
          width={900}
        >
          {loading ? (
            <Spinner />
          ) : isSuccess ? (
            <>
              <ResultsComponent
                status={'success'}
                title='Successfully Assign Assets to Request'
                subTitle={`Request Number: ${assetData?.requestId}`}
                extra={[
                  <>
                    <>
                      {id && (
                        <Button
                          className='button2'
                          style={{ color: 'white' }}
                          onClick={() => setDownloadGatepass(true)}
                        >
                          Download Gatepass
                        </Button>
                      )}
                    </>
                    <br />
                    <Button
                      className='button'
                      key={'done'}
                      style={{ marginTop: 20, color: 'white' }}
                      onClick={onDoneClick}
                    >
                      Done
                    </Button>
                  </>,
                ]}
              />
            </>
          ) : (
            <div className='generate-assign-asset-body'>
              <div className='asset-detail-items'>
                <Row>
                  <Col xs={24} xl={8}>
                    <div className='asset-detail-item'>
                      Request Number: <span>{assetData?.requestId}</span>
                    </div>
                  </Col>
                  <Col xs={24} xl={8}>
                    <div className='asset-detail-item'>
                      Request Type: <span>Branch</span>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col xs={24} xl={8}>
                    <div className='asset-detail-item'>
                      Requestor: <span>{assetData?.user?.userName}</span>
                    </div>
                  </Col>
                  <Col xs={24} xl={8}>
                    <div className='asset-detail-item'>
                      Location: <span>{assetData?.branchTo?.name}</span>
                    </div>
                  </Col>
                </Row>
              </div>
              <div className='asset-collapse'>
                <CollapseComponent
                  items={[
                    ...(items?.map((item: any) => ({
                      header: `${item?.categoryName} | Requested: ${item?.quantity} | Assigned: ${item?.items?.length}`,
                      body: (
                        <AssetRequestForm
                          assetData={item}
                          setFormData={setFormData}
                          formData={formData}
                          submitDisabled={submitDisabled}
                          setSubmitDisabled={setSubmitDisabled}
                          setDisableCategories={setDisableCategories}
                        />
                      ),
                    })) || []),
                  ]}
                />
              </div>
              {disableCategories.map((category, index) => {
                return (
                  <Alert
                    style={{ marginBottom: '10px' }}
                    key={index}
                    message={`${category.category} - Requested ${category?.requested} - assigned ${category?.assigned}`}
                    type='warning'
                  />
                );
              })}
              <Button
                disabled={submitDisabled}
                className='submit-btn button3'
                type='primary'
                onClick={onSubmitClick}
              >
                Submit
              </Button>
            </div>
          )}
        </ModalComponent>
      </div>
    </>
  );
};

export default AssignAssetModal;
