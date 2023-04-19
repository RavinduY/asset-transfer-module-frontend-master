/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useEffect, useState } from 'react';
import { Badge, Button, Input, List, Select, Space, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';

import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import { API_ROUTES, MOMENT_FORMATS } from '@/utils/constants';
import { useQuery } from '@/hooks/useQuery';
import ActionModal from '@/containers/ActionModal';
import AssetRequestActionModal from '@/containers/AssetRequestActionModal';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchNotifications } from '@/store/notifications';

import './styles.scss';

const { TabPane } = Tabs;
const { Option } = Select;

interface TabInfo {
  key: string;
  name: string;
  count?: number;
  url: string;
  requestIdName: string;
  saveURL: string;
  afterSubmit: () => void;
}

const ApprovalsPage: FC = (): JSX.Element => {
  const tabs: TabInfo[] = [
    {
      key: 'request',
      name: 'Asset Request',
      url: API_ROUTES.APPROVAL.ASSET_REQUEST,
      requestIdName: 'assetTransferReqId',
      saveURL: API_ROUTES.ASSET_STATUS.CREATE,
      afterSubmit: () => retryOne(),
    },
    {
      key: 'assign',
      name: 'Assign Asset',
      url: API_ROUTES.APPROVAL.ASSIGN_ASSET_REQUEST,
      requestIdName: 'assetTransferReqId',
      saveURL: '/assign_asset/addNewStatus',
      afterSubmit: () => retryTwo(),
    },
    {
      key: 'transfer',
      name: 'Asset Transfer',
      url: API_ROUTES.APPROVAL.ASSET_TRANSFER_REQUEST,
      requestIdName: 'assetTransferReqId',
      saveURL: '/transfer-req-status',
      afterSubmit: () => retryThree(),
    },
    {
      key: 'department',
      name: 'Mini Asset Transfer',
      url: API_ROUTES.APPROVAL.INTER_DEPARMENT_TRANSFER_REQUEST,
      requestIdName: 'assetTransferReqId',
      saveURL: '/interTranferReqest/addNewStatus',
      afterSubmit: () => retryFour(),
    },
    {
      key: 'other',
      name: 'Repair/Disposal/Donation',
      url: API_ROUTES.APPROVAL.ASSET_REMOVAL_REQUEST,
      requestIdName: 'assetTransferReqId',
      saveURL: '/removal/createStatus',
      afterSubmit: () => retryFive(),
    },
  ];

  const { branches } = useAppSelector((store) => store.branch);

  const [searchText, setSearchText] = useState('');
  const [branch, setBranch] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [data, setData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedItem, setSelectedItem] = useState<any>();
  const [selectedTab, setSelectedTab] = useState('');

  useEffect(() => {
    setSelectedTab(localStorage.getItem('approvalType') || 'request');
  }, []);

  const { data: one, retry: retryOne } = useQuery({
    url: API_ROUTES.APPROVAL.ASSET_REQUEST,
  });

  const { data: two, retry: retryTwo } = useQuery({
    url: API_ROUTES.APPROVAL.ASSIGN_ASSET_REQUEST,
  });

  const { data: three, retry: retryThree } = useQuery({
    url: API_ROUTES.APPROVAL.ASSET_TRANSFER_REQUEST,
  });

  const { data: four, retry: retryFour } = useQuery({
    url: API_ROUTES.APPROVAL.INTER_DEPARMENT_TRANSFER_REQUEST,
  });
  const { data: five, retry: retryFive } = useQuery({
    url: API_ROUTES.APPROVAL.ASSET_REMOVAL_REQUEST,
  });
  const {
    data: approval,
    retry,
    loading,
  } = useQuery({
    url,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    const url =
      tabs.find((tab) => tab.key === localStorage.getItem('approvalType'))?.url ||
      API_ROUTES.APPROVAL.ASSET_REQUEST;
    setUrl(url);
  }, []);

  useEffect(() => {
    if (approval && Array.isArray(approval)) {
      if (!branch) {
        setData(mapData());
      } else {
        const filteredApp = mapData().filter((ap) => {
          return (
            ap?.branchTo?.name === branch ||
            ap?.toDepartmentName === branch ||
            ap?.fromDepartment?.name === branch ||
            ap?.branchTo?.name === branch
          );
        });
        setData(filteredApp);
      }
    }
  }, [approval]);

  useEffect(() => {
    if (approval && Array.isArray(approval)) {
      const filteredApp = mapData().filter((ap) => {
        return (
          ap?.branchTo?.name === branch ||
          ap?.toDepartmentName === branch ||
          ap?.fromDepartment?.name === branch ||
          ap?.branchTo?.name === branch
        );
      });
      setData(filteredApp);
    }
  }, [branch]);

  const mapData = () => {
    if (approval && Array.isArray(approval)) {
      return approval?.map((ap) => {
        return {
          ...ap,
          requestNumber: ap?.requestId || ap?.removalRequestId?.name || ap?.interRequestId,
        };
      });
    } else {
      return [];
    }
  };

  const handleSearchClick = () => {
    if (approval && Array.isArray(approval)) {
      let filteredData = mapData();
      if (searchText) {
        filteredData = filteredData.filter((da) => da.requestNumber.includes(searchText));
      }
      setData(filteredData);
    }
  };

  useEffect(() => {
    if (url) {
      retry();
    }
  }, [url]);

  const onMenuTabsChange = (name: string) => {
    localStorage.setItem('approvalType', name);
    setData([]);
    setSelectedTab(name);
    const url = tabs.find((tab) => tab.key === name)?.url;

    if (url) {
      setUrl(url);
    }
    setBranch(null);
    setData([]);
  };

  const renderTableFilters = () => {
    return (
      <div className='filters'>
        <Select
          onChange={(e) => setBranch(e)}
          showSearch={true}
          value={branch}
          className='ant-select-wrapper'
          placeholder={'Select Branch'}
        >
          {branches.map((branch) => (
            <Option key={branch.id} value={branch.name}>
              {branch.name}
            </Option>
          ))}
        </Select>
        <Input
          placeholder='Search by Request Number#'
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button className='button' onClick={handleSearchClick}>
          Search
        </Button>
      </div>
    );
  };

  const renderCount = (i: number) => {
    if (i === 0) {
      // @ts-ignore
      return one?.length;
    }
    if (i === 1) {
      // @ts-ignore
      return two?.length;
    }
    if (i === 2) {
      // @ts-ignore
      return three?.length;
    }
    if (i === 3) {
      // @ts-ignore
      return four?.length;
    }
    if (i === 4) {
      // @ts-ignore
      return five?.length;
    }
  };

  const dispatch = useAppDispatch();

  return (
    <div className='ApprovalsPage'>
      <Tabs
        defaultActiveKey={localStorage.getItem('approvalType') || 'request'}
        onTabClick={onMenuTabsChange}
      >
        {tabs?.map(({ name, key, afterSubmit }, index) => {
          return (
            <TabPane
              tab={
                <span>
                  <Space>
                    {name}
                    <Badge count={renderCount(index) || 0} />
                  </Space>
                </span>
              }
              key={key}
            >
              {renderTableFilters()}
              <div className='panel-display'>
                <List
                  loading={loading}
                  size='large'
                  pagination={{
                    size: 'small',
                    pageSize: 5,
                  }}
                  dataSource={data}
                  renderItem={(item) => {
                    return (
                      <>
                        {item ? (
                          <List.Item
                            key={item?.requestId}
                            className='pointer'
                            onClick={() => setSelectedItem(item)}
                          >
                            <div style={{ width: '100%' }} onClick={() => setSelectedItem(item)}>
                              <List.Item.Meta
                                title={
                                  <>
                                    {item?.requestId ||
                                      item?.interRequestId ||
                                      item?.removalRequestId?.name ||
                                      ''}
                                    {'  '}
                                    {item?.createdAt &&
                                      moment(new Date(item?.createdAt || '')).format(
                                        MOMENT_FORMATS.YYYY_DD_MM,
                                      )}
                                  </>
                                }
                                description={
                                  item?.branchTo?.name ||
                                  item?.branch?.name ||
                                  item?.toDepartmentName ||
                                  item?.fromDepartment?.name ||
                                  ''
                                }
                              />
                            </div>
                            {selectedTab === 'request' ? (
                              <AssetRequestActionModal
                                assetRequest={item}
                                element={<>{item?.currentAction?.name}</>}
                                id={item?.id}
                                onAfterSubmit={retry}
                              />
                            ) : (
                              <ActionModal
                                id={item?.id}
                                items={(item?.requestItems || item?.selectedData)?.map(
                                  (item: any) => {
                                    return {
                                      id: item?.id,
                                      categoryName: item?.categoryName,
                                      cbcs: item?.items?.map((it: any) => it?.cbc),
                                      quantity: item?.quantity,
                                      costPerUnits: item?.costPerUnits,
                                    };
                                  },
                                )}
                                status={item?.currentAction?.name}
                                color={item?.currentAction?.color}
                                data={item}
                                onAfterSubmit={() => {
                                  retry();
                                  afterSubmit();
                                  dispatch(fetchNotifications());
                                }}
                                title={`Transfer - #${
                                  item?.requestId ||
                                  item?.interRequestId ||
                                  item?.removalRequestId?.name
                                }`}
                                url={tabs.find((tab) => tab.key === selectedTab)?.saveURL || ''}
                              />
                            )}
                          </List.Item>
                        ) : null}
                      </>
                    );
                  }}
                />
              </div>
            </TabPane>
          );
        })}
      </Tabs>
    </div>
  );
};

export default withAuth(ApprovalsPage);
