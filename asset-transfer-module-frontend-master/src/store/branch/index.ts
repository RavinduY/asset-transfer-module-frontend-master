/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/utils/constants';
import http from '@/services/http';

export interface Branch {
  id: number;
  name: string;
  location: string;
  branchCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchState {
  branches: Branch[];
  loading: boolean;
}

const initialState: BranchState = {
  branches: [],
  loading: false,
};

export const fetchBranches = createAsyncThunk('branch/fetchBranches', async () => {
  try {
    const res = await http.get<any>(API_ROUTES.BRANCH.ALL);
    const branches: Branch[] = res.data?.data?.map((branch: any) => ({
      branchCode: branch?.branchCode || '',
      createdAt: branch?.createdAt || '',
      updatedAt: branch?.updatedAt || '',
      id: branch?.id || -1,
      location: branch?.location || '',
      name: branch?.name || '',
    }));
    return branches;
  } catch (err) {
    return [];
  }
});

export const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setBranches: (state: BranchState, action: PayloadAction<Branch[]>): void => {
      state.branches = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state: BranchState) => {
        state.loading = true;
        state.branches = [];
      })
      .addCase(fetchBranches.fulfilled, (state: BranchState, action: PayloadAction<Branch[]>) => {
        state.loading = false;
        state.branches = action.payload;
      })
      .addCase(fetchBranches.rejected, (state: BranchState) => {
        state.loading = false;
        state.branches = [];
      });
  },
});

export const { setBranches } = branchSlice.actions;

export default branchSlice.reducer;
