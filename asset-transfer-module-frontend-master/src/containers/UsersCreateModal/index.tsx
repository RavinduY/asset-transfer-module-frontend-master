/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Alert, Button, message } from 'antd';
import { RcFile } from 'antd/lib/upload';
import { FC, useState } from 'react';
import FileDragger from '@/components/FileDragger';
import ModalComponent from '@/components/Modal';
import { User, userColumns } from '@/pages/UserManagementPage';
import TableComponent from '@/containers/Table';
import { readXlAsJson } from '@/utils/xl';
import ResultsComponent from '@/components/Result';
import { useMutation } from '@/hooks/useMutate';
import { API_ROUTES, MESSAGES } from '@/utils/constants';

import './styles.scss';

const UsersCreateModal: FC = (): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, loading } = useMutation({
    url: API_ROUTES.USER.BULK_CREATE,
  });

  const handleOnBeforeUpload = (file: RcFile) => {
    const fileNameSplit = file.name.split('.');
    const isXl = fileNameSplit[fileNameSplit.length - 1] === 'xlsx';
    if (!isXl) {
      message.error('Please select a xl file');
    }
    return isXl;
  };

  const formatData = (data: unknown[]) => {
    let errors: string[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let users: any = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((usersData: any) => {
      users = [
        ...users,
        {
          userName: usersData[0],
          firstName: usersData[1],
          lastName: usersData[2],
          email: usersData[3],
          role: [usersData[4]],
          managerId: usersData[5],
          branchId: usersData[6],
          departmentId: usersData[7],
          isActive: usersData[8],
          password: usersData[9] ? usersData[9] : 'password',
        },
      ];
    });
    users.forEach((user: User, i: number) => {
      const values = Object.values(user);
      if (values.length !== 10) {
        errors = [...errors, `Error in line ${i + 1}`];
        return;
      }
      const isEmpty = values.some((value, index) => {
        if (index === 5 || index === 6 || index === 7) {
          return false;
        }

        return value === '' || !value;
      });
      if (isEmpty) {
        errors = [...errors, `Error in line ${i + 1}`];
        return;
      }
    });
    if (errors.length > 0) {
      return setError(errors[0]);
    }
    setUsers(users.filter((_: object, i: number) => i !== 0));
  };

  const handleOnChange = (e: File) => {
    setError('');
    readXlAsJson(e, formatData);
  };

  const handleUploadClick = () => {
    setVisible(true);
    setIsSuccess(false);
    setUsers([]);
  };

  const handleSaveClick = async () => {
    const res = await mutate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      users?.map((user: any) => ({
        password: 'password',
        ...user,
        isActive: user.isActive === 'Active' ? true : false,
      })),
    );
    if (res.success) {
      setIsSuccess(true);
    } else if (res.errors) {
      // @ts-ignore
      const errors: { data: { data: string[] } } = res.errors;
      errors?.data?.data?.map((error) => {
        message.error(error);
      });
    } else {
      message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
    }
  };

  const onDoneClick = () => {
    setVisible(false);
    setIsSuccess(false);
    setUsers([]);
  };

  return (
    <>
      <Button className='button3' onClick={handleUploadClick}>
        Upload
      </Button>
      <div className='UsersCreateModal'>
        <>
          <ModalComponent
            title={users?.length > 0 ? 'Upload Users' : ''}
            visible={visible}
            onClose={() => setVisible(false)}
            width={isSuccess ? 600 : users?.length > 0 ? 1200 : 600}
          >
            <>
              {isSuccess ? (
                <>
                  <ResultsComponent
                    status={'success'}
                    title='Successfully Uploaded Users'
                    extra={[
                      <Button className='done-button' key={'done'} onClick={onDoneClick}>
                        Done
                      </Button>,
                    ]}
                  />
                </>
              ) : (
                <>
                  {users.length === 0 ? (
                    <>
                      <div className='file-dragger'>
                        <FileDragger
                          title='Click or drag execl file here'
                          description='Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files'
                          beforeUpload={handleOnBeforeUpload}
                          onChange={handleOnChange}
                        />
                      </div>
                      {error && (
                        <Alert
                          className='file-dragger-error'
                          message='Error'
                          description={error}
                          type='error'
                        />
                      )}
                    </>
                  ) : (
                    <div className='user-preview'>
                      <Button onClick={handleUploadClick}>Upload Again</Button>
                      <TableComponent data={users} columns={userColumns} />
                      <Button className='save-button' onClick={handleSaveClick} disabled={loading}>
                        Save
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          </ModalComponent>
        </>
      </div>
    </>
  );
};

export default UsersCreateModal;
