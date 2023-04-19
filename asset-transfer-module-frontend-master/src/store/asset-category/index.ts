/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/utils/constants';
import http from '@/services/http';

export interface AssetCategorie {
  id: number;
  name: string;
  cost: number;
  revicedCost: number;
  departmentId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetCategoryState {
  assetCategories: AssetCategorie[];
  loading: boolean;
}

const initialState: AssetCategoryState = {
  assetCategories: [],
  loading: false,
};

export const fetchAssetCategories = createAsyncThunk(
  'assetCategories/fetchAssetCategories',
  async () => {
    try {
      const res: any = await http.get<Partial<AssetCategorie[]>>(
        `${API_ROUTES.ASSET_CATEGORY.ALL}?page=1&pageSize=1000000`,
      );
      const assetCategories: AssetCategorie[] = res.data.data?.map((category: any) => ({
        name: category?.name || '',
        createdAt: category?.createdAt || '',
        updatedAt: category?.updatedAt || '',
        id: category?.id || -1,
        cost: category?.cost || 0.0,
        revicedCost: category?.revicedCost || 0.0,
        departmentId: category.department?.id,
      }));
      return assetCategories;
    } catch (err) {
      return [];
    }
  },
);

export const assetCategorySlice = createSlice({
  name: 'assetCategory',
  initialState,
  reducers: {
    setAssetCategories: (
      state: AssetCategoryState,
      action: PayloadAction<AssetCategorie[]>,
    ): void => {
      state.assetCategories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetCategories.pending, (state: AssetCategoryState) => {
        state.loading = true;
        state.assetCategories = [];
      })
      .addCase(
        fetchAssetCategories.fulfilled,
        (state: AssetCategoryState, action: PayloadAction<AssetCategorie[]>) => {
          state.loading = false;
          state.assetCategories = action.payload;
        },
      )
      .addCase(fetchAssetCategories.rejected, (state: AssetCategoryState) => {
        state.loading = false;
        state.assetCategories = [];
      });
  },
});

export const { setAssetCategories } = assetCategorySlice.actions;

export default assetCategorySlice.reducer;
