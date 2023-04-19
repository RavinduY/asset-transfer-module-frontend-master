import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/utils/constants';
import http from '@/services/http';

interface UserRole {
  id: number;
  name: string;
}

export interface UserState {
  userRoles: UserRole[];
  loading: boolean;
}

const initialState: UserState = {
  userRoles: [],
  loading: true,
};

export const checkUserRoles = createAsyncThunk('user/fetchUserRoles', async () => {
  try {
    const res = await http.get(API_ROUTES.USER.ROLES);
    return res.data?.data as any;
  } catch (err) {
    return [];
  }
});

export const userSlice = createSlice({
  name: 'userRoles',
  initialState,
  reducers: {
    setUser: (state: UserState, action: PayloadAction<UserRole[]>): void => {
      state.userRoles = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkUserRoles.fulfilled, (state, action: PayloadAction<UserRole[]>) => {
        state.loading = false;
        state.userRoles = action.payload;
      })
      .addCase(checkUserRoles.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
