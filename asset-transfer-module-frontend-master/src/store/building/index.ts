/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/utils/constants';
import http from '@/services/http';

export interface Building {
  id: number;
  name: string;
  location: string;
  branchCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuildingState {
  buildings: Building[];
  loading: boolean;
}

const initialState: BuildingState = {
  buildings: [],
  loading: false,
};

export const fetchBuildings = createAsyncThunk('building/fetchBuildings', async () => {
  try {
    const res = await http.get<any>(API_ROUTES.BUILDINGS.ALL);
    const buildings: Building[] = res.data?.data?.map((branch: any) => ({
      branchCode: branch?.branchCode || '',
      createdAt: branch?.createdAt || '',
      updatedAt: branch?.updatedAt || '',
      id: branch?.id || -1,
      location: branch?.location || '',
      name: branch?.name || '',
    }));
    return buildings;
  } catch (err) {
    return [];
  }
});

export const buildingSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setBuildings: (state: BuildingState, action: PayloadAction<Building[]>): void => {
      state.buildings = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildings.pending, (state: BuildingState) => {
        state.loading = true;
        state.buildings = [];
      })
      .addCase(
        fetchBuildings.fulfilled,
        (state: BuildingState, action: PayloadAction<Building[]>) => {
          state.loading = false;
          state.buildings = action.payload;
        },
      )
      .addCase(fetchBuildings.rejected, (state: BuildingState) => {
        state.loading = false;
        state.buildings = [];
      });
  },
});

export const { setBuildings } = buildingSlice.actions;

export default buildingSlice.reducer;
