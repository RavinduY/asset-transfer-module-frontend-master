/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, List, message, Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import { API_ROUTES, MESSAGES } from '@/utils/constants';
import AssetCategoryUploadModal from '@/containers/AssetCategoryUploadModal';
import { downloadXL } from '@/utils/xl';
import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutate';
import { compose } from 'lodash/fp';
import { PaginationProps, withPagination } from '@/components/Hoc/withPagination/withPagination';
import PaginationComponent from '@/components/Pagination';
import { FilterProps, withFilters } from '@/components/Hoc/withFilters/withFilters';
import { v4 as uuid } from 'uuid';

import './styles.scss';

const { TabPane } = Tabs;

interface AssetCategory {
  key: number;
  name: string;
}

interface Reminder {
  id: number;
  remindAfter: number;
  autoApprove: number;
}

type Props = PaginationProps & FilterProps;

const SettingsPage: FC<Props> = ({
  page,
  pageSize,
  onPageChange,
  url,
  setBaseUrl,
}): JSX.Element => {
  const [form] = Form.useForm();

  const [type, setType] = useState<string>('Branch');
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [reminder, setReminder] = useState<Reminder>();
  const [departmentId, setDepatmentId] = useState<number | null>(null);
  const [assetCategoryUploadModalShow, setAssetCategoryUploadModalShow] = useState(false);
  const [requestId, setRequestId] = useState<string>(uuid());

  const postFix = type === 'Branch' ? 'Branch' : type === 'Department' ? 'Department' : '';

  const location = useLocation();

  const { data, loading, meta } = useQuery({
    url,
    page,
    pageSize,
  });

  useEffect(() => {
    const url = `${API_ROUTES.ASSET_CATEGORY.ALL}?Type=${postFix}`;
    setBaseUrl(url);
  }, [postFix]);

  useEffect(() => {
    handleSearchClick(true);
  }, [type]);

  const { data: reminderInfo, loading: getReminderLoading } = useQuery({
    url: API_ROUTES.REMINDER.UPDATE,
  });

  const { mutate, loading: reminderLoading } = useMutation({
    url: API_ROUTES.REMINDER.CREATE,
  });

  const { mutate: updateReminder, loading: updateReminderLoading } = useMutation({
    url: API_ROUTES.REMINDER.UPDATE,
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const items = data as any;
      setCategories(
        items?.map((category: any) => ({
          key: category.id,
          name: category.name,
        })),
      );
    }
  }, [data]);

  useEffect(() => {
    if (reminderInfo) {
      const reminder = reminderInfo as any;
      setReminder(reminder);
    }
  }, [reminderInfo]);

  const validateMessages = {
    types: {
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be higher than 0',
    },
  };

  const clearSearchFields = () => {
    setRequestId(uuid());
    setSearchText('');
    setDepatmentId(null);
  };
  const navigate = useNavigate();
  const handleSearchClick = (isClear?: boolean) => {
    if (isClear) {
      clearSearchFields();
      return navigate(`/settings?Type=${postFix}`);
    }
    const prefix = `/settings?Type=${postFix}&search=${searchText}`;
    const url = departmentId ? `${prefix}&departmentId=${departmentId}` : prefix;
    navigate(url);
  };

  // const handleUploadClick = (isDepartment: boolean) => {
  //   setAssetCategoryUploadModalShow(true);
  //   if (isDepartment) {
  //     setIsDepartmentAssetCategory(isDepartment);
  //   }
  // };

  useEffect(() => {
    localStorage.setItem('settingsType', 'branch');
  }, []);

  const { data: downloadData, retry: download } = useQuery({
    url,
    page: -1,
    notFetchOnLoad: true,
  });

  const downloadAsXl = async () => {
    await download();
  };

  useEffect(() => {
    if (downloadData && Array.isArray(downloadData)) {
      const formattedData = downloadData?.map((assetRequest: any) => ({
        'Asset Category': assetRequest?.name,
      }));
      downloadXL('Asset Category', formattedData);
    }
  }, [downloadData]);

  const { data: downloadTemplateData, retry: downloadTemplate } = useQuery({
    url,
    page: -1,
    notFetchOnLoad: true,
  });

  const handleDownloadTemplate = async () => {
    await downloadTemplate();
  };

  useEffect(() => {
    if (downloadTemplateData && Array.isArray(downloadTemplateData)) {
      const formattedData = downloadTemplateData?.map((assetRequest: any) => ({
        Category: assetRequest?.requestId,
      }));
      downloadXL('asset-request', formattedData);
    }
  }, [downloadData]);

  const onFinish = async (value: any) => {
    const { remind, approve } = value;
    if ((remind || remind == 0) && (approve || approve == 0)) {
      if (!getReminderLoading && reminder) {
        const resForUpdate = await updateReminder({
          id: reminder.id,
          remindAfter: parseInt(remind),
          autoApprove: parseInt(approve),
        });
        if (resForUpdate.success) {
          message.success('Reminders updated successfully');
          form.resetFields();
          return;
        }
        message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
        return;
      }

      const resForNewReminder = await mutate({
        remindAfter: parseInt(remind),
        autoApprove: parseInt(approve),
      });
      if (resForNewReminder.success) {
        message.success('Reminders added successfully');
        form.resetFields();
        return;
      }
      message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
      return;
    }
    message.error('Please select values to add reminders');
  };

  // const onDepartmentChange = (value: string) => {};

  const onMenuTabsChange = (e: any) => {
    setType(e);
    localStorage.setItem('settingsType', e);
    setAssetCategoryUploadModalShow(false);
  };

  // const renderDepartmentValues = departments?.map((department) => (
  //   <Select.Option key={department.id}>{department.name}</Select.Option>
  // ));

  const renderBranchAssetCategoryOptions = () => {
    return (
      <div className='filters'>
        <Input
          placeholder='Search by Asset Category'
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button className='button' onClick={() => handleSearchClick()}>
          Search
        </Button>
        <Button className='button3' onClick={() => setAssetCategoryUploadModalShow(true)}>
          Upload
        </Button>
        <Button className='button2' onClick={downloadAsXl}>
          Download
        </Button>
        <Button className='button2' onClick={handleDownloadTemplate}>
          Download Template
        </Button>
        {location?.search && location.search !== '?Type=Branch' && (
          <Button className='button5' onClick={() => handleSearchClick(true)}>
            Clear
          </Button>
        )}
      </div>
    );
  };
  const renderDepartmentAssetCategoryOptions = () => {
    return (
      <div className='filters'>
        {/* <Select
          className='department-selection'
          allowClear
          placeholder='Department'
          optionFilterProp='children'
          // onChange={onDepartmentChange}
        >
          {renderDepartmentValues}
        </Select> */}
        <Input
          placeholder='Search by Asset Category'
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button className='button' onClick={() => handleSearchClick()}>
          Search
        </Button>
        <Button className='button3' onClick={() => setAssetCategoryUploadModalShow(true)}>
          Upload
        </Button>
        <Button className='button2' onClick={downloadAsXl}>
          Download
        </Button>
        <Button className='button2' onClick={handleDownloadTemplate}>
          Download Template
        </Button>
        {location?.search && location.search !== '?Type=Department' && (
          <Button className='button2' onClick={() => handleSearchClick(true)}>
            Clear
          </Button>
        )}
      </div>
    );
  };

  const renderReminderOptions = () => {
    return (
      <Form
        className='panel-display'
        name='basic'
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        validateMessages={validateMessages}
        form={form}
      >
        <Form.Item label='Remind after' name='remind' rules={[{ type: 'number', min: 0 }]}>
          {/* @ts-ignore */}
          <InputNumber addonAfter='day(s)' defaultValue={reminderInfo?.[0]?.remindAfter} />
        </Form.Item>
        <Form.Item
          label='Auto Approve (after reminder)'
          name='approve'
          rules={[{ type: 'number', min: 0 }]}
        >
          {/* @ts-ignore */}
          <InputNumber addonAfter='day(s)' defaultValue={reminderInfo?.[0]?.autoApprove} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button
            htmlType='submit'
            className='save-button button3'
            disabled={reminderLoading || updateReminderLoading}
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    const { pathname, search } = location;
    const url = `${pathname.replace('/', '')}${search}`
      .replace(`?page=${page}&pageSize=${pageSize}`, '')
      .replace(`&page=${page}&pageSize=${pageSize}`, '');
    onPageChange(url, newPage, newPageSize);
  };

  return (
    <div className='SettingsPage' key={requestId}>
      <Tabs
        defaultActiveKey={localStorage.getItem('settingsType') || 'branch'}
        centered
        onTabClick={onMenuTabsChange}
      >
        <TabPane tabKey='Branch' tab='Branch Asset category' key='Branch'>
          {renderBranchAssetCategoryOptions()}
          <div className='panel-display'>
            <List
              size='large'
              dataSource={categories}
              renderItem={(item) => <List.Item>{item.name}</List.Item>}
              loading={loading}
            />
            <div style={{ float: 'right' }}>
              <PaginationComponent
                defaultCurrent={page}
                onPageChange={handlePageChange}
                total={meta?.total || 0}
              />
            </div>
          </div>
        </TabPane>
        <TabPane tabKey='Department' tab='Department Asset category' key='Department'>
          {renderDepartmentAssetCategoryOptions()}
          <div className='panel-display'>
            <List
              size='large'
              dataSource={categories}
              renderItem={(item) => <List.Item>{item.name}</List.Item>}
            />
            <div style={{ float: 'right' }}>
              <PaginationComponent
                defaultCurrent={page}
                onPageChange={handlePageChange}
                total={meta?.total || 0}
              />
            </div>
          </div>
        </TabPane>
        <TabPane tabKey='Reminders' tab='Reminders' key='Reminders'>
          {renderReminderOptions()}
        </TabPane>
      </Tabs>
      <AssetCategoryUploadModal
        show={assetCategoryUploadModalShow}
        close={() => setAssetCategoryUploadModalShow(false)}
        isDepartment={type === 'Department'}
      />
    </div>
  );
};

export default compose(withAuth, withPagination, withFilters)(SettingsPage);
