/* eslint-disable @typescript-eslint/no-explicit-any */
import { MESSAGES, getTagColorFromStatus } from '@/utils/constants';
import { Button, Input, Tag, message } from 'antd';
import { FC, useEffect, useState } from 'react';

import ModalComponent from '@/components/Modal';
import { useAppSelector } from '@/hooks/useRedux';
import { useMutation } from '@/hooks/useMutate';
import { RequestItem } from '@/pages/AssertRequestPage';

import './styles.scss';

const { TextArea } = Input;

interface Props {
  items: any;
  id?: number;
  onAfterSubmit: () => void;
  data: any;
  status: string;
  color: string;
  title: string;
  url: string;
  loading?: boolean;
  isVisible?: string;
  hideButton?: boolean;
  handleOnClose?: () => void;
  location?: string;
  username?: string;
}

const ActionModal: FC<Props> = ({
  items,
  id,
  onAfterSubmit,
  data,
  status,
  title,
  url,
  isVisible,
  hideButton,
  handleOnClose,
  location,
  username,
  color,
}): JSX.Element => {
  const { user } = useAppSelector((store) => store.user);
  const [visible, setVisible] = useState(false);
  const [requestInfo, setRequestInfo] = useState<any>(null);
  const [reject, setReject] = useState<any>(null);
  const [approve, setApprove] = useState<any>(null);
  const [nextAction, setNextAction] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [giveMore, setGiveMore] = useState<any>(null);

  const { mutate, loading } = useMutation({
    url,
  });

  useEffect(() => {
    if (isVisible !== undefined) {
      setVisible(!!isVisible);
    }
  }, [isVisible]);

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

  const handleRequestActions = async (actionId?: string) => {
    const body = {
      comment: comment,
      gatePass: Date.now(),
      userId: user?.id,
      actionId: actionId || nextAction,
      requestId: id,
    };
    const res = await mutate(body);
    if (res.success) {
      onAfterSubmit();
      setVisible(false);
      setComment('');
      setNextAction(null);
      setReject(null);
      setApprove(null);
      setRequestInfo(null);
      message.success('Action Submitted Successfully');
      return;
    }
    message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
  };

  const getCost = (item: RequestItem) => {
    return item?.costPerUnits || 0 * item?.quantity || 0;
  };

  const isSubmitDisabled = () => {
    if ((nextAction === reject?.id || nextAction === requestInfo?.id) && !comment) {
      return true;
    }
    return false;
  };

  const allowActionUser = (actionId: any, roleId: any) => {
    return [4].includes(actionId) && roleId === 3;
  };

  return (
    <>
      {!hideButton && (
        <div onClick={() => setVisible(true)}>
          <Tag color={getTagColorFromStatus(color)}>{status}</Tag>
        </div>
      )}
      <>
        {visible && (
          <ModalComponent
            title={title}
            visible={visible}
            onClose={() => {
              setVisible(false);
              if (handleOnClose && typeof handleOnClose === 'function') {
                handleOnClose();
              }
            }}
            width={800}
            loading={loading}
          >
            <div className='ActionModal'>
              <div className='user-details'>
                <div className='user'>
                  Initiator: <span>{username || data?.user?.userName}</span>
                </div>
                <div className='location'>
                  Location:
                  <span>
                    {location ||
                      data?.toDepartment?.name ||
                      data?.branchTo?.name ||
                      data?.toDepartmentName ||
                      data?.branch?.name ||
                      data?.branchFrom?.name}
                  </span>
                </div>
                {(data.budgeted === true || data.budgeted === false) && (
                  <div className='budget'>{data.budgeted ? 'Budgeted' : 'Unbudgeted'}</div>
                )}
              </div>
              {(data.assetTransferType || data.type) && (
                <div className='user-details'>
                  <div className='user'>
                    Transfer Type:{' '}
                    <span>
                      {data.assetTransferType ||
                        (data.type === 'INTER_DEPARTMENT_TRANSFER'
                          ? 'Mini Stock Transfer'
                          : data.type)}
                    </span>
                  </div>
                </div>
              )}
              <div className='requested-items'>
                {items?.map((item: any) => (
                  <div key={item.id} className='item'>
                    <div className='category'>{item.categoryName}</div>
                    <div className='quantity'>
                      {' '}
                      - Requested: {item?.quantity || item.cbcs?.length || 0}
                    </div>
                    <div className='quantity'> - Cost: {getCost(item)}</div>
                  </div>
                ))}
              </div>
              <>
                <div className='actions'>
                  {user?.roles.find((role) => role.id === requestInfo?.role?.id) && requestInfo && (
                    <Button
                      type='primary'
                      onClick={() => setNextAction(requestInfo.id)}
                      disabled={!!nextAction && nextAction !== requestInfo.id}
                    >
                      Request More Info
                    </Button>
                  )}
                  {user?.roles.find((role) => role.id === reject?.role?.id) && reject && (
                    <Button
                      type='primary'
                      danger
                      onClick={() => setNextAction(reject.id)}
                      disabled={!!nextAction && nextAction !== reject.id}
                    >
                      Reject
                    </Button>
                  )}
                  {user?.roles.find((role) => role.id === giveMore?.role?.id) && giveMore && (
                    <Button
                      className='approve'
                      type='primary'
                      onClick={() => setNextAction(giveMore.id)}
                      disabled={!!nextAction && nextAction !== giveMore.id}
                    >
                      Give More
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
                        onClick={() => handleRequestActions(approve.id)}
                        disabled={!!nextAction && nextAction !== approve.id}
                      >
                        Approve
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

export default ActionModal;
