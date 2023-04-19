/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Input, message, Tag } from 'antd';
import { FC, useEffect, useState } from 'react';

import { AssetRequest, RequestItem } from '@/pages/AssertRequestPage';
import ModalComponent from '@/components/Modal';
import { useAppSelector } from '@/hooks/useRedux';
import { useMutation } from '@/hooks/useMutate';
import { useQuery } from '@/hooks/useQuery';
import { API_ROUTES, getTagColorFromStatus, HTTP_TYPES, MESSAGES } from '@/utils/constants';

import './styles.scss';
import UpdateRequestAssetModal from '../UpdateRequestAssetModal';

const { TextArea } = Input;

interface Props {
  assetRequest: AssetRequest;
  element: React.ReactNode;
  id?: number;
  onAfterSubmit: () => void;
  isVisible?: string;
  hideButton?: boolean;
  location?: string;
  username?: string;
}

const AssetRequestActionModal: FC<Props> = ({
  element,
  assetRequest: assetRequestData,
  id,
  onAfterSubmit,
  hideButton,
  isVisible,
  location,
  username,
}): JSX.Element => {
  const { user } = useAppSelector((store) => store.user);

  const [assetRequest, setAssetRequest] = useState(assetRequestData);
  const [visible, setVisible] = useState(false);
  const [requestInfo, setRequestInfo] = useState<any>(null);
  const [giveMore, setGiveMore] = useState<any>(null);
  const [reject, setReject] = useState<any>(null);
  const [approve, setApprove] = useState<any>(null);
  const [nextAction, setNextAction] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const { data, retry } = useQuery({
    url: API_ROUTES.ASSET_REQUEST.BY_ID.replace('#{id}', `${id}`),
    notFetchOnLoad: true,
  });

  useEffect(() => {
    if (isVisible !== undefined) {
      setVisible(!!isVisible);
    }
  }, [isVisible]);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.ASSET_STATUS.CREATE,
  });

  useEffect(() => {
    if (visible && id) {
      retry();
    }
  }, [id, visible]);

  useEffect(() => {
    if (data) {
      const actions: any = data;
      if (actions?.currentAction?.ifNo) {
        setReject(actions?.currentAction?.ifNo);
      }
      if (actions?.currentAction?.ifYes) {
        setApprove(actions?.currentAction?.ifYes);
      }
      if (actions?.currentAction?.ifrequestMore) {
        setRequestInfo(actions?.currentAction?.ifrequestMore);
      }
      if (actions?.currentAction?.ifGiveMore) {
        setGiveMore(actions?.currentAction?.ifGiveMore);
      }
    }
  }, [data]);

  const handleRequestActions = async (actionId?: string, action?: any) => {
    const body = {
      comment: comment,
      gatePass: Date.now(),
      userId: user?.id,
      actionId: actionId || nextAction,
      requestId: id,
    };
    const url =
      action?.mataData === 'Approve_b_manager_Assign' || action?.mataData === 'Partial_approve'
        ? '/assign_asset/addNewStatus'
        : API_ROUTES.ASSET_STATUS.CREATE;
    const res = await mutate(body, HTTP_TYPES.POST, {}, url);
    if (res.success) {
      onAfterSubmit();
      setVisible(false);
      setComment('');
      setNextAction(null);
      setReject(null);
      setApprove(null);
      setRequestInfo(null);
      setGiveMore(null);
      message.success('Action Submitted Successfully');
      return;
    }
    message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
  };

  const isSubmitDisabled = () => {
    if ((nextAction === reject?.id || nextAction === requestInfo?.id) && !comment) {
      return true;
    }
    return false;
  };

  const getCost = (item: RequestItem) => {
    return item?.costPerUnits || 0 * item?.quantity || 0;
  };

  const allowActionUser = (actionId: any, roleId: any) => {
    return (
      ([2, 3, 8, 15, 16, 17, 30, 35, 37].includes(actionId) && roleId === 3) ||
      ([36].includes(actionId) && roleId === 6) ||
      ([30].includes(actionId) && roleId === 2) ||
      ([18, 19, 30].includes(actionId) && roleId === 11)
    );
  };

  const updateAssetRequest = (assetRequestUpdate: AssetRequest) => {
    setAssetRequest(assetRequestUpdate);
  };

  return (
    <>
      {!hideButton && (
        <div onClick={() => setVisible(true)} style={{ cursor: 'pointer' }}>
          <Tag
            color={getTagColorFromStatus(assetRequest.currentAction?.color || '')}
            className='capitalize'
          >
            {element}
          </Tag>
        </div>
      )}
      <>
        {visible && (
          <ModalComponent
            title={`Asset Request - #${assetRequest.requestId}`}
            visible={visible}
            onClose={() => {
              setVisible(false);
            }}
            width={800}
          >
            <div className='AssetRequestActionModal'>
              <div className='user-details'>
                <div className='user'>
                  Initiator: <span>{username || assetRequest?.user?.userName}</span>
                </div>

                <div className='location'>
                  Location: <span>{location || assetRequest?.branchTo?.name}</span>
                </div>
                {(assetRequest.budgeted === true || assetRequest.budgeted === false) && (
                  <div className='budget'>{assetRequest.budgeted ? 'Budgeted' : 'Unbudgeted'}</div>
                )}
              </div>
              {assetRequest.assetTransferType && (
                <div className='user-details'>
                  <div className='user'>
                    Transfer Type: <span>{assetRequest.assetTransferType}</span>
                  </div>
                </div>
              )}
              <div className='requested-items'>
                {assetRequest?.requestItems?.map((item) => (
                  <div key={item.id} className='item'>
                    <div className='category'>{item.categoryName}</div>
                    <div className='quantity'> - Requested: {item.quantity}</div>
                    <div className='quantity'> - Cost: {getCost(item)}</div>
                  </div>
                ))}
              </div>
              <>
                <div className='actions'>
                  {assetRequest?.user?.id === user?.id &&
                    (assetRequest.currentAction.id === 8 ||
                      assetRequest.currentAction.id === 35) && (
                      <UpdateRequestAssetModal
                        assetRequest={assetRequest}
                        onAfterSubmit={updateAssetRequest}
                      />
                    )}
                  {user?.roles.find(
                    (role) =>
                      role.id === requestInfo?.role?.id ||
                      allowActionUser(requestInfo?.id, role?.id),
                  ) &&
                    requestInfo && (
                      <Button
                        type='primary'
                        onClick={() => setNextAction(requestInfo.id)}
                        disabled={!!nextAction && nextAction !== requestInfo.id}
                      >
                        Request More Info
                      </Button>
                    )}
                  {user?.roles.find(
                    (role) => role.id === reject?.role?.id || allowActionUser(reject?.id, role?.id),
                  ) &&
                    reject && (
                      <Button
                        type='primary'
                        danger
                        onClick={() => setNextAction(reject.id)}
                        disabled={!!nextAction && nextAction !== reject.id}
                      >
                        Reject
                      </Button>
                    )}
                  {user?.roles.find(
                    (role) =>
                      role.id === approve?.role?.id || allowActionUser(approve?.id, role?.id),
                  ) &&
                    approve && (
                      <Button
                        className='approve'
                        type='primary'
                        onClick={() => handleRequestActions(approve.id, approve)}
                        disabled={!!nextAction && nextAction !== approve.id}
                      >
                        Approve
                      </Button>
                    )}
                  {user?.roles.find(
                    (role) =>
                      role.id === giveMore?.role?.id || allowActionUser(giveMore?.id, role?.id),
                  ) &&
                    giveMore && (
                      <Button
                        className='approve'
                        type='primary'
                        onClick={() => setNextAction(giveMore.id)}
                        disabled={!!nextAction && nextAction !== giveMore.id}
                      >
                        Give More
                      </Button>
                    )}
                </div>
                {(nextAction === reject?.id ||
                  nextAction === requestInfo?.id ||
                  nextAction === giveMore?.id) && (
                  <div className='comment-section'>
                    <TextArea value={comment} onChange={(e) => setComment(e.target.value)} />

                    <Button
                      disabled={loading || isSubmitDisabled()}
                      onClick={() => handleRequestActions()}
                    >
                      Send
                    </Button>
                    <Button onClick={() => setNextAction(null)} disabled={loading}>
                      Back
                    </Button>
                  </div>
                )}
              </>
            </div>
          </ModalComponent>
        )}
      </>
    </>
  );
};

export default AssetRequestActionModal;
