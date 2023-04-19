import { FC, useEffect, useState } from 'react';
import { Button, Form, Input, Select, message } from 'antd';
import { compose } from 'lodash/fp';
import { KeyOutlined, SearchOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import TableComponent from '@/containers/Table';
import { ColumnsType } from 'antd/lib/table';
import { downloadXL } from '@/utils/xl';
import UsersCreateModal from '@/containers/UsersCreateModal';
import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import { useQuery } from '@/hooks/useQuery';
import { API_ROUTES, USER_ROLES, MESSAGES } from '@/utils/constants';
import PaginationComponent from '@/components/Pagination';
import { PaginationProps, withPagination } from '@/components/Hoc/withPagination/withPagination';
import { FilterProps, withFilters } from '@/components/Hoc/withFilters/withFilters';
import { useAppSelector } from '@/hooks/useRedux';
import { v4 as uuid } from 'uuid';
import { useMutation } from '@/hooks/useMutate';
import ModalComponent from '@/components/Modal';
import Spinner from '@/components/Spinner';

import './styles.scss';

const { Option } = Select;

interface Role {
  id: string;
  name: string;
}

export interface User {
  key?: string;
  id?: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string | string[];
  rolesWithId?: Role[];
  managerId?: string;
  manager?: User | null;
  branchId: string;
  departmentId: string;
  active: boolean;
}

export const userColumns: ColumnsType<object> = [
  {
    title: 'Username',
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'First Name',
    dataIndex: 'firstName',
    key: 'firstName',
  },
  {
    title: 'Last Name',
    dataIndex: 'lastName',
    key: 'lastName',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
  },
  {
    title: 'Manager',
    dataIndex: 'managerId',
    key: 'managerId',
  },
  {
    title: 'Branch',
    dataIndex: 'branchId',
    key: 'branchId',
  },
  {
    title: 'User Department',
    dataIndex: 'departmentId',
    key: 'departmentId',
  },
  {
    title: 'Is Active',
    dataIndex: 'isActive',
    key: 'isActive',
  },
  {
    title: 'Reset Password',
    dataIndex: 'resetPassword',
    key: 'resetPassword',
  },
];

type Props = PaginationProps & FilterProps;
type LastSelect = 'department' | 'branch';
type Status = '' | 'active' | 'inactive';

const UserManagementPage: FC<Props> = ({
  page,
  pageSize,
  onPageChange,
  url,
  setBaseUrl,
}): JSX.Element => {
  const [form] = Form.useForm();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<Status>('');
  const [branchId, setBranchId]: any = useState(null);
  const [departmentId, setDepartmentId] = useState(null);
  const [lastSelect, setLastSelect] = useState<LastSelect | null>(null);
  const [requestId, setRequestId] = useState<string>(uuid());
  const [userRole, setUserRole]: any = useState(0);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { branches } = useAppSelector((store) => store.branch);
  const { userRoles } = useAppSelector((store) => store.userRoles);
  const { departments } = useAppSelector((store) => store.departments);

  const navigate = useNavigate();
  const location = useLocation();

  const { mutate: resetPassword, loading: resetPasswordLoading } = useMutation({
    url: API_ROUTES.USER.RESET_PASSWORD,
  });

  useEffect(() => {
    setBaseUrl(API_ROUTES.USER.ALL_USERS);
  }, []);

  useEffect(() => {
    if (url) {
      retry();
    }
  }, [url]);

  const { data, loading, meta, retry } = useQuery({
    url,
    page,
    pageSize,
    notFetchOnLoad: true,
  });

  const { data: downloadData, retry: download } = useQuery({
    url,
    page: -1,
    notFetchOnLoad: true,
  });

  let users: User[] = data as User[];

  if (Array.isArray(data)) {
    users =
      users?.map((user) => {
        const roles: Role[] = user.rolesWithId as Role[];
        let userRoles = '';
        roles.forEach((role) => {
          userRoles += role.name;
        });

        return {
          ...user,
          key: user.id,
          managerId: user.managerId,
          branch: user.branchId,
          role: userRoles,
          isActive: user.active ? 'Active' : 'Not Active',
          department: user.departmentId,
          resetPassword: (
            <span
              className='change-password-btn'
              onClick={() => {
                setResetPasswordOpen(true);
                setSelectedUser(user);
              }}
            >
              <KeyOutlined />
            </span>
          ),
        };
      }) || [];
  }

  const handleSearchClick = (isClear?: boolean) => {
    if (isClear) {
      setUsername('');
      setEmail('');
      setBranchId(null);
      setDepartmentId(null);
      setStatus('');
      setUserRole(0);
      setRequestId(uuid());
      return navigate('/user-management');
    }

    const branchOrDepartment =
      lastSelect === null
        ? ''
        : lastSelect == 'department'
        ? `&departmentId=${departmentId}`
        : `&branchId=${branchId}`;

    navigate(
      `/user-management?userName=${username}&email=${email}${branchOrDepartment}&isActive=${status}&roleId=${userRole}`,
    );
  };

  useEffect(() => {
    if (downloadData && Array.isArray(downloadData)) {
      const formattedData = downloadData?.map((da) => ({
        Username: da.userName,
        FirstName: da.firstName,
        LastName: da.lastName,
        Email: da.email,
        Role: da.rolesWithId[0]?.name || 'Branch_User',
        Manager: da.managerId,
        'Branch / Department': da.branchId,
        'User Department': da.departmentId,
        'Is Active': da.active ? 'Active' : 'Inactive',
      }));
      downloadXL('users', formattedData);
    }
  }, [downloadData]);

  const handleDownloadClick = async () => {
    await download();
  };

  const validateMessages = {
    types: {
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be higher than 0',
    },
  };

  const onFinish = async (value: any) => {
    const { password } = value;
    if (password && password.length < 6) {
      message.error(MESSAGES.COMMON.ERRORS.PASSWORD);
      return;
    }
    if (selectedUser?.id && password) {
      const resForUpdate = await resetPassword({
        userId: selectedUser.id,
        password: password,
      });
      if (resForUpdate.success) {
        setResetPasswordOpen(false);
        message.success('User updated successfully');
        form.resetFields();
        return;
      }
      message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
      return;
    }
  };

  const renderTableFilters = () => {
    return (
      <div className='filters'>
        <Input
          className='email'
          placeholder='Email'
          prefix={<SearchOutlined />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          className='username'
          placeholder='Username'
          prefix={<SearchOutlined />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Select
          className='role'
          placeholder='All Role'
          value={userRoles.find((user) => user.id == userRole)?.name}
          onChange={(e) => {
            const roleId = userRoles.find((user) => user.name == e)?.id;
            setUserRole(roleId);
          }}
          showSearch={true}
        >
          {userRoles.map((user) => (
            <Option key={user.id} value={user.name}>
              {user.name}
            </Option>
          ))}
        </Select>
        <Select
          className='branch'
          placeholder='All Branches'
          value={branches.find((branch) => branch.id === branchId)?.name}
          onChange={(e: string) => {
            setBranchId(branches.find((branch) => branch.name === e)?.id);
            setLastSelect('branch');
          }}
          showSearch={true}
        >
          {branches.map((branch) => (
            <Option key={branch.id} value={branch.name}>
              {branch.name}
            </Option>
          ))}
        </Select>
        <Select
          className='user-departments'
          placeholder='All User Deparments'
          onChange={(e) => {
            setDepartmentId(e);
            setLastSelect('department');
          }}
        >
          {departments.map((department) => (
            <Option key={department.id} value={department.id}>
              {department.name}
            </Option>
          ))}
        </Select>
        <Select className='status' placeholder='Status' onChange={(e) => setStatus(e)}>
          <Option value={true}>All</Option>
          <Option value={true}>Active</Option>
          <Option value={false}>Inactive</Option>
        </Select>
        <Button className='button' onClick={() => handleSearchClick()}>
          Search
        </Button>
        <Button className='button2' onClick={handleDownloadClick}>
          Download
        </Button>
        <UsersCreateModal />
        {location?.search && (
          <Button className='button5' onClick={() => handleSearchClick(true)}>
            Clear
          </Button>
        )}
        {!!resetPasswordOpen && (
          <ModalComponent
            visible={resetPasswordOpen}
            onClose={() => {
              setResetPasswordOpen(false);
              form.resetFields();
            }}
            title={`Reset the password - ${selectedUser?.userName}`}
            width={600}
          >
            {
              <div>
                <Form
                  style={{ display: 'flex' }}
                  className='panel-display'
                  name='basic'
                  onFinish={onFinish}
                  validateMessages={validateMessages}
                  form={form}
                >
                  <Form.Item
                    label='New Password'
                    name='password'
                    rules={[{ required: true, message: 'Please input your password!' }]}
                  >
                    <Input placeholder='Enter new password' />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      htmlType='submit'
                      className='button3 reset-password-submit-button'
                      style={{ color: 'white', float: 'right', marginLeft: '10px' }}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            }
          </ModalComponent>
        )}
      </div>
    );
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    const { pathname, search } = location;
    const url = `${pathname.replace('/', '')}${search}`
      .replace(`?page=${page}&pageSize=${pageSize}`, '')
      .replace(`&page=${page}&pageSize=${pageSize}`, '');
    onPageChange(url, newPage, newPageSize);
  };

  if (resetPasswordLoading) {
    return <Spinner />;
  }

  return (
    <div className='UserManagementPage' key={requestId}>
      {renderTableFilters()}
      <div className='user-table'>
        <TableComponent data={users} columns={userColumns} loading={loading} />
        <div className='user-pagination'>
          <PaginationComponent
            defaultCurrent={page}
            total={meta?.total || 0}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

const UserManagementPageWithAuth = withAuth(UserManagementPage, [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.USER_ADMIN,
]);

export default compose(withPagination, withFilters)(UserManagementPageWithAuth);
