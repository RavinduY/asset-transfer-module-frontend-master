import { FC, lazy } from 'react';
import { Outlet, Routes as ReactRouter, Route } from 'react-router-dom';
import Loadable from '@/components/Loadable';
import { useAppSelector } from '@/hooks/useRedux';
import AppLayout from '@/components/Layouts/AppLayout';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/utils/constants';
import RapairDisposalDonationPage from './pages/RapairDisposalDonationPage';
import AssetTransferPage from './pages/AssetTransferPage';

const AssertRequestPage = Loadable(lazy(() => import('@/pages/AssertRequestPage')));
const HomePage = Loadable(lazy(() => import('@/pages/HomePage')));
const LoginPage = Loadable(lazy(() => import('@/pages/LoginPage')));
const CBCGeneratorPage = Loadable(lazy(() => import('@/pages/CBCGeneratorPage')));
const UserManagementPage = Loadable(lazy(() => import('@/pages/UserManagementPage')));
const BudgetModulePage = Loadable(lazy(() => import('@/pages/BudgetModulePage')));
const AssignAssetPage = Loadable(lazy(() => import('@/pages/AssignAssetPage')));
// const AssetTransferPage = Loadable(lazy(() => import('@/pages/AssetTransferPage')));
const CostPerUnitPage = Loadable(lazy(() => import('@/pages/CostPerUnitPage')));
const SettingsPage = Loadable(lazy(() => import('@/pages/SettingsPage')));
const InterDepartmentTransferPage = Loadable(
  lazy(() => import('@/pages/InterDepartmentTransferPage')),
);
const ApprovalsPage = Loadable(lazy(() => import('@/pages/ApprovalsPage')));

const Routes: FC = () => {
  const { loading } = useAppSelector((store) => store.user);

  if (loading) {
    return <Spinner />;
  }

  return (
    <ReactRouter>
      <Route
        path={'/'}
        element={
          <AppLayout>
            <Outlet />
          </AppLayout>
        }
      >
        <Route index element={<HomePage />} />
        <Route path={ROUTES.ASSERT_REQUEST} element={<AssertRequestPage />} />
        <Route path={ROUTES.CBC_GENERATOR} element={<CBCGeneratorPage />} />
        <Route path={ROUTES.USER_MANAGEMENT} element={<UserManagementPage />} />
        <Route path={ROUTES.BUDGET_MODULE} element={<BudgetModulePage />} />
        <Route path={ROUTES.ASSIGN_ASSET} element={<AssignAssetPage />} />
        <Route path={ROUTES.ASSET_TRANSFER} element={<AssetTransferPage />} />
        <Route path={ROUTES.COST_PER_UNIT} element={<CostPerUnitPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.INTER_DEPARTMENT} element={<InterDepartmentTransferPage />} />
        <Route path={ROUTES.RE_DE_DO} element={<RapairDisposalDonationPage />} />
        <Route path={ROUTES.APPROVALS} element={<ApprovalsPage />} />
      </Route>
      <Route path={'/login'} element={<LoginPage />} />
    </ReactRouter>
  );
};

export default Routes;
