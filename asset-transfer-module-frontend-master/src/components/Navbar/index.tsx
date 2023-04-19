import { FC, useState } from 'react';
import { Badge, Button, Dropdown, Menu, Popover } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { ArrowLeftOutlined, BellFilled, UserOutlined } from '@ant-design/icons';
import Breadcrumb from '@/components/Breadcrumb';
import { ACCESS_TOKEN, API_ROUTES, mapPathNameToBreadcrumb } from '@/utils/constants';
import ActionModal from '@/containers/ActionModal';
import { fetchNotifications, Notification } from '@/store/notifications';
import AssetRequestActionModal from '@/containers/AssetRequestActionModal';

import './styles.scss';

const logoutUser = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  window.location.href = '/login';
};

const menu = (
  <Menu
    items={[
      {
        key: '1',
        label: <div onClick={logoutUser}>Logout</div>,
      },
    ]}
  />
);

const Navbar: FC = (): JSX.Element => {
  const { user } = useAppSelector((store) => store.user);
  const { notifications } = useAppSelector((store) => store.notifications);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { name } = mapPathNameToBreadcrumb(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [url, setUrl] = useState('');
  const [type, setType] = useState('');

  const findUrl = (type: string) => {
    switch (type) {
      case 'ASSET_REQUEST': {
        return API_ROUTES.ASSET_STATUS.CREATE;
      }
      case 'ASSIGN_REQUEST': {
        return '/assign_asset/addNewStatus';
      }
      case 'ASSET_TRANSFER': {
        return '/transfer-req-status';
      }
      case 'INTER_DEPARTMENT_TRANSFER': {
        return '/interTranferReqest/addNewStatus';
      }
      case 'REMOVAL_TRANSFER': {
        return '/removal/createStatus';
      }
      default: {
        return '';
      }
    }
  };

  const findType = (type: string) => {
    switch (type) {
      case 'ASSET_REQUEST': {
        return 'request';
      }
      case 'ASSIGN_REQUEST': {
        return 'assign';
      }
      case 'ASSET_TRANSFER': {
        return 'transfer';
      }
      case 'INTER_DEPARTMENT_TRANSFER': {
        return 'department';
      }
      case 'REMOVAL_TRANSFER': {
        return 'other';
      }
      default: {
        return '';
      }
    }
  };

  const handleOnClick = (notification: Notification) => {
    const type = findType(notification.type);
    setSelectedNotification(notification);
    setIsOpen(true);
    setUrl(findUrl(notification.type));
    setType(type);
    // findType(notification.type);
    // localStorage.setItem('approvalType', type);
    // navigate(`/approvals?type=${type}`);
  };
  const content = () => {
    return (
      <>
        {notifications?.map((notification, index) => (
          <div className='notifications' key={index} onClick={() => handleOnClick(notification)}>
            <div className='left'>
              <div className='requestId'>{notification.requestId}</div>
              <div className='description'>{notification.description}</div>
            </div>
            <div className='right capitalize'>
              {notification.currentAction?.name?.replace('_', ' ') || ''}
            </div>
          </div>
        ))}
      </>
    );
  };

  const dispatch = useAppDispatch();

  const refetchNotifications = () => {
    dispatch(fetchNotifications());
  };

  const selectedRequestType = { ...selectedNotification };

  if (selectedRequestType && type === 'request') {
    selectedRequestType.requestItems = selectedNotification?.itemList;
  }

  return (
    <div className='Navbar'>
      {isOpen && selectedNotification && url && (
        <>
          {type === 'request' ? (
            <AssetRequestActionModal
              assetRequest={selectedRequestType}
              element={<>{selectedNotification?.currentAction?.name}</>}
              id={selectedNotification?.id}
              onAfterSubmit={refetchNotifications}
              hideButton={true}
              isVisible={'true'}
              location={
                selectedNotification?.branchName ||
                selectedNotification?.branchTo ||
                selectedNotification?.toDepartmentName
              }
              username={selectedNotification?.userName}
            />
          ) : (
            <ActionModal
              color={selectedNotification?.currentAction?.color}
              key={'uuid()'}
              hideButton={true}
              isVisible={'true'}
              id={selectedNotification?.id}
              items={(
                selectedNotification?.requestItems ||
                selectedNotification?.selectedData ||
                selectedNotification?.itemList
              )?.map((item: any) => {
                return {
                  id: item?.id,
                  categoryName: item?.categoryName,
                  cbcs: item?.items?.map((item: any) => item?.cbc),
                  quantity: item?.quantity,
                  costPerUnits: item?.costPerUnits,
                };
              })}
              status={selectedNotification?.currentAction?.name}
              data={selectedNotification}
              onAfterSubmit={refetchNotifications}
              title={`Transfer - #${
                selectedNotification?.requestId ||
                selectedNotification?.interRequestId ||
                selectedNotification?.removalRequestId?.name
              }`}
              handleOnClose={() => {
                setUrl('');
                setSelectedNotification(null);
                setIsOpen(false);
              }}
              url={url}
              location={
                selectedNotification?.branchName ||
                selectedNotification?.branchTo ||
                selectedNotification?.toDepartmentName
              }
              username={selectedNotification?.userName}
            />
          )}
        </>
      )}
      <div className='header'>
        <div className='left-side'>
          <Breadcrumb />
        </div>
        <div className='right-side'>
          <div className='icons'>
            <Popover
              overlayStyle={{ width: 400, maxHeight: 400, overflow: 'auto' }}
              placement='topRight'
              title={'Notifications'}
              content={content()}
              trigger='click'
            >
              <Badge count={notifications.length}>
                <BellFilled />
              </Badge>
            </Popover>
          </div>
          <div className='user'>
            <span className='username'>{user?.userName}</span>
            <Dropdown overlay={menu} placement='bottomLeft' arrow>
              <Button type='primary' shape='circle' icon={<UserOutlined />} />
            </Dropdown>
          </div>
        </div>
      </div>
      <div className='navigation'>
        {name && (
          <>
            <ArrowLeftOutlined onClick={() => navigate(-1)} />
            <span>{name}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
