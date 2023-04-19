import { useEffect, useState } from 'react';
import { PieChartTwoTone, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { ROUTES, USER_ROLES } from '@/utils/constants';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import logo from '@/assets/com_bank.png';

import './styles.scss';

interface SIDE_BAR_ITEMS {
  label: string | JSX.Element;
  key: string;
  icon?: JSX.Element | null;
  children?: SIDE_BAR_ITEMS[];
  type?: string;
  path: string;
  visible: boolean;
}

const getClassName = (selected: string, path: string) => {
  return selected === path ? 'selected-menu' : '';
};

const App = () => {
  const { user } = useAppSelector((store) => store.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string>('');

  useEffect(() => {
    findActiveItem();
  }, [location.pathname]);

  const findActiveItem = () => {
    const activeItem = items.find((item) => location.pathname.includes(item.path))?.path;
    const otherItems: string[] = [];
    items.forEach((item) => {
      item.children?.forEach((child) => {
        if (child) {
          otherItems.push(child.key);
        }
      });
    });
    const activeItem2 = otherItems.find((item) => location.pathname.includes(item));
    if (activeItem) {
      return setActiveItem(activeItem);
    }
    if (activeItem2) {
      return setActiveItem(activeItem2);
    }
    setActiveItem('/');
  };

  const handleItemClick = (path: ROUTES) => {
    setActiveItem(path);
    navigate(path);
  };

  const checkMenuVisibility = (roles: string[]) => {
    if (roles.length == 0) {
      return true;
    }
    const userRoles = user?.roles?.map((role) => role.name) || [];
    return roles.some((item) => userRoles.includes(item));
  };

  const items: SIDE_BAR_ITEMS[] = [
    {
      key: ROUTES.BUDGET_MODULE,
      label: (
        <div
          onClick={() => handleItemClick(ROUTES.BUDGET_MODULE)}
          className={getClassName(activeItem, ROUTES.BUDGET_MODULE)}
        >
          Budget Module
        </div>
      ),
      icon: <PieChartTwoTone />,
      children: [],
      path: ROUTES.BUDGET_MODULE,
      visible: checkMenuVisibility([
        USER_ROLES.SUPER_ADMIN,
        USER_ROLES.BUDGET_ADMIN,
        USER_ROLES.BRANCH_USER,
        USER_ROLES.BRANCH_MANAGER,
        USER_ROLES.USER_DEPARTMENT_USER,
        USER_ROLES.USER_DEPARTMENT_MANAGER,
        USER_ROLES.CFO,
      ]),
    },
    {
      key: ROUTES.ASSERT_REQUEST,
      label: (
        <div
          onClick={() => handleItemClick(ROUTES.ASSERT_REQUEST)}
          className={getClassName(activeItem, ROUTES.ASSERT_REQUEST)}
        >
          Assert Request
        </div>
      ),
      icon: <PieChartTwoTone />,
      children: [],
      path: ROUTES.ASSERT_REQUEST,
      visible: checkMenuVisibility([]),
    },
    {
      key: ROUTES.ASSIGN_ASSET,
      label: (
        <div
          onClick={() => handleItemClick(ROUTES.ASSIGN_ASSET)}
          className={getClassName(activeItem, ROUTES.ASSIGN_ASSET)}
        >
          Assert Transfer
        </div>
      ),
      icon: <PieChartTwoTone />,
      children: [
        {
          key: ROUTES.ASSIGN_ASSET,
          label: (
            <div
              onClick={() => handleItemClick(ROUTES.ASSIGN_ASSET)}
              className={getClassName(activeItem, ROUTES.ASSIGN_ASSET)}
            >
              Assign Asset
            </div>
          ),
          path: ROUTES.ASSIGN_ASSET,
          visible: checkMenuVisibility([
            USER_ROLES.SUPER_ADMIN,
            USER_ROLES.USER_DEPARTMENT_USER,
            USER_ROLES.USER_ADMIN,
            USER_ROLES.CONFIGURATION_ADMIN,
          ]),
        },
        {
          key: ROUTES.ASSET_TRANSFER,
          label: (
            <div
              onClick={() => handleItemClick(ROUTES.ASSET_TRANSFER)}
              className={getClassName(activeItem, ROUTES.ASSET_TRANSFER)}
            >
              Transfer
            </div>
          ),
          path: ROUTES.ASSET_TRANSFER,
          visible: checkMenuVisibility([]),
        },
        {
          key: ROUTES.INTER_DEPARTMENT,
          label: (
            <div
              onClick={() => handleItemClick(ROUTES.INTER_DEPARTMENT)}
              className={getClassName(activeItem, ROUTES.INTER_DEPARTMENT)}
            >
              Mini Stock Transfer
            </div>
          ),
          path: ROUTES.INTER_DEPARTMENT,
          visible: checkMenuVisibility([]),
        },
        {
          key: ROUTES.RE_DE_DO,
          label: (
            <div
              onClick={() => handleItemClick(ROUTES.RE_DE_DO)}
              className={getClassName(activeItem, ROUTES.RE_DE_DO)}
            >
              Repair/Dispose/Donation
            </div>
          ),
          path: ROUTES.RE_DE_DO,
          visible: checkMenuVisibility([]),
        },
      ],
      path: ROUTES.ASSIGN_ASSET,
      visible: checkMenuVisibility([]),
    },
    {
      key: ROUTES.APPROVALS,
      label: (
        <div
          onClick={() => handleItemClick(ROUTES.APPROVALS)}
          className={getClassName(activeItem, ROUTES.APPROVALS)}
        >
          Approvals
        </div>
      ),
      icon: <PieChartTwoTone />,
      children: [],
      path: ROUTES.APPROVALS,
      visible: checkMenuVisibility([]),
    },
    {
      key: ROUTES.SETTINGS,
      label: (
        <div
          onClick={() => handleItemClick(ROUTES.SETTINGS)}
          className={getClassName(activeItem, ROUTES.SETTINGS)}
        >
          Settings
        </div>
      ),
      icon: <PieChartTwoTone />,
      children: [],
      path: ROUTES.SETTINGS,
      visible: checkMenuVisibility([USER_ROLES.SUPER_ADMIN, USER_ROLES.USER_ADMIN]),
    },
    {
      key: ROUTES.USER_MANAGEMENT,
      label: (
        <div
          onClick={() => handleItemClick(ROUTES.USER_MANAGEMENT)}
          className={getClassName(activeItem, ROUTES.USER_MANAGEMENT)}
        >
          User Management
        </div>
      ),
      icon: <PieChartTwoTone />,
      children: [],
      path: ROUTES.USER_MANAGEMENT,
      visible: checkMenuVisibility([USER_ROLES.SUPER_ADMIN, USER_ROLES.USER_ADMIN]),
    },
    {
      key: ROUTES.CBC_GENERATOR,
      label: (
        <div
          onClick={() => handleItemClick(ROUTES.CBC_GENERATOR)}
          className={getClassName(activeItem, ROUTES.CBC_GENERATOR)}
        >
          CBC Generator
        </div>
      ),
      icon: <PieChartTwoTone />,
      children: [],
      path: ROUTES.CBC_GENERATOR,
      visible: checkMenuVisibility([
        USER_ROLES.SUPER_ADMIN,
        USER_ROLES.CONFIGURATION_ADMIN,
        USER_ROLES.USER_DEPARTMENT_USER,
        USER_ROLES.USER_DEPARTMENT_MANAGER,
      ]),
    },
    {
      key: ROUTES.COST_PER_UNIT,
      label: (
        <div
          onClick={() => handleItemClick(ROUTES.COST_PER_UNIT)}
          className={getClassName(activeItem, ROUTES.COST_PER_UNIT)}
        >
          Cost Per Unit
        </div>
      ),
      icon: <PieChartTwoTone />,
      children: [],
      path: ROUTES.COST_PER_UNIT,
      visible: checkMenuVisibility([USER_ROLES.SUPER_ADMIN, USER_ROLES.BUDGET_ADMIN]),
    },
  ];

  const getUserRols = () => {
    return user?.roles?.map((role) => role.name.replaceAll('_', ' ')).toString();
  };

  const filtertedItems = items.map((item) => {
    const it = item.children?.filter((item) => item.visible) || [];
    item.children = it;
    return item;
  });

  return (
    <>
      <img className='logo' src={logo} />
      <div className='user-details'>
        <div className='user-icon'>
          <Avatar size={50} shape='circle' icon={<UserOutlined />} />
          <Badge className='online-icon' color='green' />
        </div>

        <div className='details'>
          <div className='name'>{user?.userName}</div>
          <div className='role'>{getUserRols() || ''}</div>
          <div className='branch'>{user?.department?.name || user?.branch?.name || ''}</div>
        </div>
      </div>
      <div className='Sidebar'>
        <Menu
          style={{
            width: 256,
          }}
          mode='inline'
          items={filtertedItems?.filter((item) => item.visible)}
        />
      </div>
    </>
  );
};

export default App;
