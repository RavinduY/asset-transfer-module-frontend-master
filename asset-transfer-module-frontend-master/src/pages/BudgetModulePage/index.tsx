/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useEffect, useState } from 'react';
import { Button, DatePicker, Select } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { downloadXL } from '@/utils/xl';
import TableComponent from '@/containers/Table';
import BudgetUploadModal from '@/containers/BudgetUploadModal';
import AmendBudgetModal from '@/containers/AmendBudgetModal';
import { useQuery } from '@/hooks/useQuery';
import { compose } from 'lodash/fp';
import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import { PaginationProps, withPagination } from '@/components/Hoc/withPagination/withPagination';
import { API_ROUTES, MOMENT_FORMATS, USER_ROLES } from '@/utils/constants';
import PaginationComponent from '@/components/Pagination';
import { FilterProps, withFilters } from '@/components/Hoc/withFilters/withFilters';
import { useAppSelector } from '@/hooks/useRedux';
import { v4 as uuid } from 'uuid';
import { withAuthorization } from '@/components/Hoc/withAuthorization';

import './styles.scss';

const { Option } = Select;

const budgetColumns: ColumnsType<object> = [
  {
    title: 'Branch Name',
    dataIndex: 'branchName',
    key: 'branchName',
    // @ts-ignore
    sorter: (a: Budget, b: Budget) =>
      typeof b?.branchName?.localeCompare === 'function' &&
      b?.branchName?.localeCompare(a?.branchName),
  },
  {
    title: 'Budget Type',
    dataIndex: 'budgetType',
    key: 'budgetType',
    // @ts-ignore
    sorter: (a: Budget, b: Budget) =>
      typeof b?.budgetType?.localeCompare === 'function' &&
      b?.budgetType?.localeCompare(a?.budgetType),
  },
  {
    title: 'Year',
    dataIndex: 'year',
    key: 'year',
    // @ts-ignore
    sorter: (a: Budget, b: Budget) =>
      typeof b?.budgetType?.localeCompare === 'function' &&
      b?.budgetType?.localeCompare(a?.budgetType),
  },
  {
    title: 'Asset Category',
    dataIndex: 'assetCategory',
    key: 'assetCategory',
    // @ts-ignore
    sorter: (a: Budget, b: Budget) =>
      typeof b?.assetCategory?.localeCompare === 'function' &&
      b?.assetCategory?.localeCompare(a?.assetCategory),
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    // @ts-ignore
    sorter: (a: Budget, b: Budget) => a.quantity - b.quantity,
  },
  {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
    // @ts-ignore
    sorter: (a: Budget, b: Budget) => a.balance - b.balance,
  },
  {
    title: 'Cost per unit',
    dataIndex: 'costPerUnit',
    key: 'costPerUnit',
    // @ts-ignore
    sorter: (a: Budget, b: Budget) => a.costPerUnit - b.costPerUnit,
  },
  {
    title: 'Total Cost',
    dataIndex: 'totalCost',
    key: 'totalCost',
    // @ts-ignore
    render: (_: string, budget: any) => (
      <div>
        {isNaN(budget.costPerUnit * budget.quantity) ? 0 : budget.costPerUnit * budget.quantity}
      </div>
    ),
    // @ts-ignore
    sorter: (a: Budget, b: Budget) => a.totalCost - b.totalCost,
  },
];

interface Budget {
  key: string;
  branchName: string;
  budgetType: string;
  assetCategory: string;
  quantity: string;
  balance: string;
  costPerUnit: string;
  totalCost: string;
}
type Props = PaginationProps & FilterProps;

const BudgetModulePage: FC<Props> = ({
  page,
  pageSize,
  onPageChange,
  url,
  setBaseUrl,
}): JSX.Element => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [branchId, setBranchId]: any = useState('');
  const [budgetTypeId, setBudgetTypeId] = useState('');
  const [category, setCategoryId]: any = useState('');
  const [year, setYear] = useState<any>('');
  const [requestId, setRequestId] = useState<string>(uuid());

  const { user } = useAppSelector((store) => store.user);
  const { branches } = useAppSelector((store) => store.branch);
  const { budgetTypes } = useAppSelector((store) => store.budgetTypes);
  const { assetCategories } = useAppSelector((store) => store.assetCategory);

  useEffect(() => {
    setBaseUrl(API_ROUTES.BUDGET.ALL);
  }, []);

  const { data, loading, meta, retry } = useQuery({
    url,
    page,
    pageSize,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    if (url) {
      retry();
    }
  }, [url]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setBudgets(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?.map((budget: any, i: number) => ({
          ...budget,
          key: `${i}`,
        })),
      );
    }
  }, [data]);

  const navigate = useNavigate();

  const clearSearchFields = () => {
    setRequestId(uuid());
    setBranchId('');
    setBudgetTypeId('');
    setCategoryId('');
    setYear('');
  };

  const handleSearchClick = (isClear?: boolean) => {
    if (isClear) {
      clearSearchFields();
      return navigate('/budget-module');
    }
    navigate(
      `/budget-module?year=${year}&branchId=${branchId}&budgetTypeId=${budgetTypeId}&catId=${category}`,
    );
  };

  const { data: downloadData, retry: download } = useQuery({
    url,
    page: -1,
    notFetchOnLoad: true,
  });

  useEffect(() => {
    if (downloadData && Array.isArray(downloadData)) {
      const formattedData = downloadData?.map((budget) => ({
        'Branch Name': budget.branchName,
        'Budget Type': budget.budgetType,
        'Asset Category': budget.assetCategory,
        Quantity: budget.quantity,
        Balance: budget.balance,
      }));
      downloadXL('budgets', formattedData);
    }
  }, [downloadData]);

  const handleDownloadClick = async () => {
    await download();
  };

  const downloadTemplate = async () => {
    const formattedData = [1]?.map(() => ({
      'Branch Name': '',
      'Budget Type': '',
      'Asset Category': '',
      Quantity: '',
      Balance: '',
    }));
    downloadXL('budgets_template', formattedData);
  };

  const renderTableFilters = () => {
    return (
      <div className='filters'>
        <Select
          className='branch'
          placeholder='All Branches'
          onChange={(e) => {
            setBranchId(branches?.find((branch) => branch.name === e)?.id);
          }}
          value={branches?.find((branch) => branch.id === branchId)?.name}
          showSearch={true}
        >
          {branches.map((branch) => (
            <Option key={branch.id} value={branch.name}>
              {branch.name}
            </Option>
          ))}
        </Select>
        <Select
          className='budget-type'
          placeholder='Budget Type'
          onChange={(e) => {
            setBudgetTypeId(e);
          }}
        >
          {budgetTypes.map((budgetType) => (
            <Option key={budgetType.id} value={budgetType.id}>
              {budgetType.name}
            </Option>
          ))}
        </Select>
        <DatePicker
          className='year'
          picker='year'
          bordered={true}
          placeholder='Select Year'
          onChange={(e) => {
            setYear(moment(e).format(MOMENT_FORMATS.YYYY));
          }}
        />
        <Select
          className='asset-category'
          placeholder='Asset Category'
          value={assetCategories?.find((ca) => ca.id === category)?.name}
          onChange={(e) => {
            setCategoryId(assetCategories?.find((ca) => ca.name === e)?.id);
          }}
          showSearch={true}
        >
          {assetCategories.map((category) => (
            <Option key={category.id} value={category.name}>
              {category.name}
            </Option>
          ))}
        </Select>
        <Button className='button' onClick={() => handleSearchClick()}>
          Search
        </Button>
        <>
          {withAuthorization(
            <>
              <Button className='button2' onClick={handleDownloadClick}>
                Download
              </Button>
            </>,
            [
              USER_ROLES.SUPER_ADMIN,
              USER_ROLES.BUDGET_ADMIN,
              USER_ROLES.USER_DEPARTMENT_USER,
              USER_ROLES.USER_DEPARTMENT_MANAGER,
              USER_ROLES.BRANCH_MANAGER,
              USER_ROLES.BRANCH_USER,
            ],
            user?.roles?.map((role) => role.name) || [],
          )}
        </>

        <>
          {withAuthorization(
            <>
              <BudgetUploadModal onAfterSubmit={retry} />
              <AmendBudgetModal onAfterSubmit={retry} />
              <Button className='button2' onClick={downloadTemplate}>
                Download Template
              </Button>
            </>,
            [USER_ROLES.SUPER_ADMIN, USER_ROLES.BUDGET_ADMIN],
            user?.roles?.map((role) => role.name) || [],
          )}
        </>

        {location?.search && (
          <Button className='button5' onClick={() => handleSearchClick(true)}>
            Clear
          </Button>
        )}
      </div>
    );
  };
  const location = useLocation();
  const handlePageChange = (newPage: number, newPageSize: number) => {
    const { pathname, search } = location;
    const url = `${pathname.replace('/', '')}${search}`
      .replace(`?page=${page}&pageSize=${pageSize}`, '')
      .replace(`&page=${page}&pageSize=${pageSize}`, '');
    onPageChange(url, newPage, newPageSize);
  };

  return (
    <div className='BudgetModulePage' key={requestId}>
      {renderTableFilters()}
      <div className='budget-table'>
        <TableComponent data={budgets} columns={budgetColumns} loading={loading} />
        <div className='budget-pagination'>
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

const BudgetModulePageWithAuth = withAuth(BudgetModulePage, [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.BUDGET_ADMIN,
  USER_ROLES.BRANCH_USER,
  USER_ROLES.BRANCH_MANAGER,
  USER_ROLES.USER_DEPARTMENT_USER,
  USER_ROLES.USER_DEPARTMENT_MANAGER,
  USER_ROLES.CFO,
]);

export default compose(withPagination, withFilters)(BudgetModulePageWithAuth);
