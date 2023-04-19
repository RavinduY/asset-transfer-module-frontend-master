/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Select } from 'antd';
import { compose } from 'lodash/fp';
import { ColumnsType } from 'antd/lib/table';
import { withAuth } from '@/components/Hoc/withAuth/withAuth';
import { PaginationProps, withPagination } from '@/components/Hoc/withPagination/withPagination';
import PaginationComponent from '@/components/Pagination';
import TableComponent from '@/containers/Table';
import { useQuery } from '@/hooks/useQuery';
import { useAppSelector } from '@/hooks/useRedux';
import CostPerUnitModal from '@/containers/CostPerUnitModal';
import AmendCostPerUnitModal from '@/containers/AmmendCostPerUnitModal';
import { downloadXL, exportAsExcelFile, transform, XlRowData, XlTransferData } from '@/utils/xl';
import { API_ROUTES } from '@/utils/constants';

import './styles.scss';
import { pickBy } from 'lodash';
import { FilterProps, withFilters } from '@/components/Hoc/withFilters/withFilters';
import { AssetCategorie } from '@/store/asset-category';

const { Option } = Select;

export const costPerUnitColumns: ColumnsType<object> = [
  {
    title: 'Asset Category',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Cost Per Unit (Rs)',
    dataIndex: 'revicedCost',
    key: 'revicedCost',
  },
];

export interface UnitPrice {
  assetCategory: string;
  costPerUnit: number;
  key: number;
}

type Props = FilterProps & PaginationProps;

const CostPerUnitPage: FC<Props> = ({
  page,
  pageSize,
  onPageChange,
  url,
  setBaseUrl,
}): JSX.Element => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const { assetCategories } = useAppSelector((store) => store.assetCategory);
  const [ac, setAc] = useState<AssetCategorie[]>([]);

  useEffect(() => {
    setAc(assetCategories);
  }, [assetCategories]);

  const [costPerUnits, setCostPerUnits] = useState<any>([]);

  useEffect(() => {
    setBaseUrl(API_ROUTES.ASSET_CATEGORY.ALL);
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

  const { data: downloadData, retry: download } = useQuery({
    url: API_ROUTES.ASSET_CATEGORY.ALL,
    page: -1,
    notFetchOnLoad: true,
  });

  const handleSearchClick = () => {
    const baseUrl = '/cost-per-unit';

    const filters = {
      search: searchText,
    };

    const nonEmptyFilters = pickBy(filters, (value) => value && value.length > 0);
    const filtersParams = Object.keys(nonEmptyFilters).map((key) => {
      return `${key}=${encodeURIComponent(nonEmptyFilters[key] || '')}`;
    });
    const url = filtersParams.length > 0 ? `${baseUrl}?${filtersParams.join('&')}` : baseUrl;
    navigate(url);
  };

  const handleDownloadClick = async () => {
    await download();
  };

  useEffect(() => {
    if (downloadData && Array.isArray(downloadData)) {
      const formattedData = downloadData?.map((request) => ({
        'Asset Category': request?.name,
        'Cost per unit': request?.revicedCost,
      }));
      downloadXL('cost per unit', formattedData);
    }
  }, [downloadData]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setCostPerUnits(data?.map((cost) => ({ key: cost.id, ...cost })));
    }
  }, [data, loading]);

  const handleDownloadTemplate = () => {
    const data: XlTransferData[] = [
      {
        name: 'data1',
        values: [
          {
            header: 'Asset Category',
            // value: assetCategories?.map((category) => ({ name: category.name })),
            value: '',
          },
          { header: 'Cost Per Unit', value: '' },
        ],
      },
    ];

    const datas: XlRowData[] = [];

    const workbookData = transform(data, assetCategories.length);
    exportAsExcelFile(workbookData, datas, 'cost_per_unit');
  };

  const renderTableFilters = () => {
    return (
      <div className='filters'>
        <Select
          className='category'
          placeholder='Asset Categorys'
          showSearch={true}
          onChange={(e) => setSearchText(e)}
          value={searchText}
          onSearch={(searchText) => {
            setAc([
              ...assetCategories,
              {
                cost: 1,
                createdAt: `${new Date()}`,
                id: Date.now(),
                name: searchText,
                revicedCost: 0,
                updatedAt: `${new Date()}`,
              },
            ]);
          }}
        >
          {ac?.map((category) => (
            <Option key={category.id} value={category.name}>
              {category.name}
            </Option>
          ))}
        </Select>
        <div className='buttons-section'>
          <Button className='search button' onClick={handleSearchClick}>
            Search
          </Button>
          <Button className='download button2' onClick={handleDownloadClick}>
            Download
          </Button>
          <CostPerUnitModal />
          <AmendCostPerUnitModal onAfterSubmit={retry} />
          <Button className='download button2' onClick={handleDownloadTemplate}>
            Download Template
          </Button>
        </div>
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
    <div className='CostPerUnitPage'>
      {renderTableFilters()}
      <div className='cost-table'>
        <TableComponent data={costPerUnits} columns={costPerUnitColumns} loading={loading} />
        <div className='cost-pagination'>
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

export default compose(withAuth, withPagination, withFilters)(CostPerUnitPage);
