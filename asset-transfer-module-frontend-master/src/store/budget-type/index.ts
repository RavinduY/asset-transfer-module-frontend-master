/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/utils/constants';
import http from '@/services/http';

export interface BudgetType {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetTypeState {
  budgetTypes: BudgetType[];
  loading: boolean;
}

const initialState: BudgetTypeState = {
  budgetTypes: [],
  loading: false,
};

export const fetchBudgetTypes = createAsyncThunk('budget-type/fetchBudgetTypes', async () => {
  try {
    const res = await http.get<any>(API_ROUTES.BUDGET.BUDGET_TYPE);
    const budgetTypes: BudgetType[] = res.data?.map((budgetType: any) => ({
      name: budgetType?.name || '',
      id: budgetType?.id || 0,
      createdAt: budgetType?.createdAt || '',
      updatedAt: budgetType?.updatedAt || '',
    }));
    return budgetTypes;
  } catch (err) {
    return [];
  }
});

export const budgetTypeSlice = createSlice({
  name: 'budget-type',
  initialState,
  reducers: {
    setBudgetTypes: (state: BudgetTypeState, action: PayloadAction<BudgetType[]>): void => {
      state.budgetTypes = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgetTypes.pending, (state: BudgetTypeState) => {
        state.loading = true;
        state.budgetTypes = [];
      })
      .addCase(
        fetchBudgetTypes.fulfilled,
        (state: BudgetTypeState, action: PayloadAction<BudgetType[]>) => {
          state.loading = false;
          state.budgetTypes = action.payload;
        },
      )
      .addCase(fetchBudgetTypes.rejected, (state: BudgetTypeState) => {
        state.loading = false;
        state.budgetTypes = [];
      });
  },
});

export const { setBudgetTypes } = budgetTypeSlice.actions;

export default budgetTypeSlice.reducer;
