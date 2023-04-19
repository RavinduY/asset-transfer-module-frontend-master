/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/utils/constants';
import http from '@/services/http';

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  miniDepartment?: string;
}

export interface DepartmentState {
  departments: Department[];
  loading: boolean;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
};

export const fetchDepartments = createAsyncThunk('department/fetchDepartments', async () => {
  try {
    const res = await http.get<any>(API_ROUTES.DEPARTMENTS.ALL);
    const departments: Department[] = res.data?.data?.map((department: any) => ({
      createdAt: department?.createdAt || '',
      updatedAt: department?.updatedAt || '',
      id: department?.id || -1,
      name: department?.name || '',
    }));
    return departments;
  } catch (err) {
    return [];
  }
});

export const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    setDepartments: (state: DepartmentState, action: PayloadAction<Department[]>): void => {
      state.departments = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state: DepartmentState) => {
        state.loading = true;
        state.departments = [];
      })
      .addCase(
        fetchDepartments.fulfilled,
        (state: DepartmentState, action: PayloadAction<Department[]>) => {
          state.loading = false;
          state.departments = action.payload;
        },
      )
      .addCase(fetchDepartments.rejected, (state: DepartmentState) => {
        state.loading = false;
        state.departments = [];
      });
  },
});

export const { setDepartments } = departmentSlice.actions;

export default departmentSlice.reducer;
