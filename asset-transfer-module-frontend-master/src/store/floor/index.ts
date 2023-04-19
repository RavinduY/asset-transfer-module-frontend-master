/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/utils/constants';
import http from '@/services/http';

export interface Floor {
  id: number;
  name: string;
  location: string;
  branchCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface FloorState {
  floors: Floor[];
  loading: boolean;
}

const initialState: FloorState = {
  floors: [],
  loading: false,
};

export const fetchFloor = createAsyncThunk('floor/fetchFloor', async () => {
  try {
    const res = await http.get<any>(API_ROUTES.FLOOR.ALL);
    const floors: Floor[] = res.data?.data?.map((branch: any) => ({
      branchCode: branch?.branchCode || '',
      createdAt: branch?.createdAt || '',
      updatedAt: branch?.updatedAt || '',
      id: branch?.id || -1,
      location: branch?.location || '',
      name: branch?.name || '',
    }));
    return floors;
  } catch (err) {
    return [];
  }
});

export const floorSlice = createSlice({
  name: 'floor',
  initialState,
  reducers: {
    setBranches: (state: FloorState, action: PayloadAction<Floor[]>): void => {
      state.floors = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFloor.pending, (state: FloorState) => {
        state.loading = true;
        state.floors = [];
      })
      .addCase(fetchFloor.fulfilled, (state: FloorState, action: PayloadAction<Floor[]>) => {
        state.loading = false;
        state.floors = action.payload;
      })
      .addCase(fetchFloor.rejected, (state: FloorState) => {
        state.loading = false;
        state.floors = [];
      });
  },
});

export const { setBranches } = floorSlice.actions;

export default floorSlice.reducer;
