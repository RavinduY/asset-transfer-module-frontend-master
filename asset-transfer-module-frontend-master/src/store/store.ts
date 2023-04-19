import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
import userReducer from '@/store/user';
import userRolesReducer from '@/store/userRoles';
import branchReducer from '@/store/branch';
import assetCategoryReducer from '@/store/asset-category';
import departmentReducer from '@/store/department';
import budgetTypesReducer from '@/store/budget-type';
import notificationsReducer from '@/store/notifications';
import buildingsReducer from '@/store/building';
import floorsReducer from '@/store/floor';

export const store = configureStore({
  reducer: {
    user: userReducer,
    userRoles: userRolesReducer,
    branch: branchReducer,
    assetCategory: assetCategoryReducer,
    departments: departmentReducer,
    budgetTypes: budgetTypesReducer,
    notifications: notificationsReducer,
    buildings: buildingsReducer,
    floors: floorsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
