import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/utils/constants';
import http from '@/services/http';
import { Branch, fetchBranches } from '@/store/branch';
import { fetchAssetCategories } from '@/store/asset-category';
import { fetchDepartments, Department } from '@/store/department';
import { fetchBudgetTypes } from '@/store/budget-type';
import { fetchNotifications } from '@/store/notifications';
import { checkUserRoles } from '@/store/userRoles';
import { fetchBuildings } from '@/store/building';
import { fetchFloor } from '@/store/floor';

interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  roles: UserRole[];
  managerId: string;
  branch: Branch;
  department: Department;
  active: boolean;
}

export interface UserState {
  user: User | null;
  authenticated: null | boolean;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  authenticated: false,
  loading: true,
};

export const checkUser = createAsyncThunk('user/checkUser', async (_, thunkApi) => {
  try {
    const res = await http.get<User>(API_ROUTES.USER.WHO_AM_I);
    thunkApi.dispatch(fetchNotifications());
    thunkApi.dispatch(fetchBranches());
    thunkApi.dispatch(fetchAssetCategories());
    thunkApi.dispatch(fetchDepartments());
    thunkApi.dispatch(fetchBudgetTypes());
    thunkApi.dispatch(fetchBuildings());
    thunkApi.dispatch(fetchFloor());
    thunkApi.dispatch(checkUserRoles());
    return res.data;
  } catch (err) {
    return null;
  }
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state: UserState, action: PayloadAction<User | null>): void => {
      state.user = action.payload;
      state.authenticated = action.payload ? true : false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.user = action.payload;
        state.authenticated = action.payload ? true : false;
      })
      .addCase(checkUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
