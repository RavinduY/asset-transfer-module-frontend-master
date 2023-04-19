/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/utils/constants';
import http from '@/services/http';

enum Type {
  ASSET_REQUEST = 'ASSET_REQUEST',
  ASSIGN_REQUEST = 'ASSIGN_REQUEST',
  ASSET_TRANSFER = 'ASSET_TRANSFER',
  INTER_DEPARTMENT_TRANSFER = 'INTER_DEPARTMENT_TRANSFER',
  REMOVAL_TRANSFER = 'REMOVAL_TRANSFER',
}

export interface Notification {
  id: number;
  currentAction: any;
  description: string | null;
  requestId: string;
  type: Type;
  itemList: any[];
  isBudgeted: boolean | null;
  budgeted?: boolean | null;
}

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
};

export const fetchNotifications = createAsyncThunk('notification/fetchNotifications', async () => {
  try {
    const res = await http.get<any>(API_ROUTES.NOTIFICATIONS.NOTIFICATIONS);
    const notifications: Notification[] = res.data?.data?.map((notification: Notification) => ({
      ...notification,
      budgeted: notification?.isBudgeted,
    }));
    return notifications || [];
  } catch (err) {
    return [];
  }
});

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state: NotificationState, action: PayloadAction<Notification[]>): void => {
      state.notifications = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state: NotificationState) => {
        state.loading = true;
        state.notifications = [];
      })
      .addCase(
        fetchNotifications.fulfilled,
        (state: NotificationState, action: PayloadAction<Notification[]>) => {
          state.loading = false;
          state.notifications = action.payload;
        },
      )
      .addCase(fetchNotifications.rejected, (state: NotificationState) => {
        state.loading = false;
        state.notifications = [];
      });
  },
});

export const { setNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;
