export enum HTTP_TYPES {
  'GET' = 'get',
  'POST' = 'post',
  'PUT' = 'put',
  'DELETE' = 'delete',
  'PATCH' = 'patch',
}

export const BASE_API = '';

export const ACCESS_TOKEN = 'ACCESS_TOKEN';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';

export enum ROUTES {
  HOME = '/',
  BUDGET_MODULE = '/budget-module',
  ASSERT_REQUEST = '/asset-request',
  ASSERT_TRANSFER = '/assert-transfer/assign',
  APPROVALS = '/approvals',
  SETTINGS = '/settings',
  USER_MANAGEMENT = '/user-management',
  CBC_GENERATOR = '/cbc-generator',
  ASSIGN_ASSET = '/assert-transfer/assign',
  INTER_DEPARTMENT = '/assert-transfer/inter-department',
  TRANSFER = '/assert-transfer/transfer',
  RE_DE_DO = '/assert-transfer/repair-disposal-donetion',
  COST_PER_UNIT = '/cost-per-unit',
  ASSET_TRANSFER = '/assert-transfer/transfer',
}

interface IBREAD_CRUMBS {
  path: string;
  name: string;
}

const BREAD_CRUMBS: IBREAD_CRUMBS[] = [
  {
    path: ROUTES.ASSERT_REQUEST,
    name: 'Assert Request',
  },
  {
    path: ROUTES.CBC_GENERATOR,
    name: 'CBC Generator',
  },
  {
    path: ROUTES.USER_MANAGEMENT,
    name: 'User Management',
  },
  {
    path: ROUTES.BUDGET_MODULE,
    name: 'Budget Module',
  },
  {
    path: ROUTES.ASSIGN_ASSET,
    name: 'Assign Asset',
  },
  {
    path: ROUTES.SETTINGS,
    name: 'Settings',
  },
  {
    path: ROUTES.ASSET_TRANSFER,
    name: 'Transfer',
  },
  {
    path: ROUTES.INTER_DEPARTMENT,
    name: 'Mini Stock Transfer',
  },
  {
    path: ROUTES.TRANSFER,
    name: 'Transfer',
  },
  {
    path: ROUTES.RE_DE_DO,
    name: 'Repair/Disposal/Donation',
  },
  {
    path: ROUTES.APPROVALS,
    name: 'Approvals',
  },
  {
    path: ROUTES.COST_PER_UNIT,
    name: 'Cost Per Unit',
  },
];

export const mapPathNameToBreadcrumb = (pathname: string): IBREAD_CRUMBS => {
  const { path, name }: IBREAD_CRUMBS = BREAD_CRUMBS.find((brudecrumb) =>
    pathname.includes(brudecrumb.path),
  ) || { path: '', name: '' };
  return {
    path,
    name,
  };
};

export const MOMENT_FORMATS = {
  YYYY_DD_MM: 'YYYY-MM-DD',
  YYYY: 'YYYY',
  HHMM: 'HH:mm',
};
export const API_ROUTES = {
  ASSET_CATEGORY: {
    ALL: '/asset_category',
  },
  NOTIFICATIONS: {
    COUNT: '/approvals/requestApprovalCount',
    NOTIFICATIONS: '/approvals/requestApprovals',
  },
  GATEPASS: {
    REMOVAL: '/removal/getGatepass/#{id}',
    ASSET_TRANSFER: '/asset-transfer-req/getGatepass/#{id}',
    INTER_DEPARTMENT: '/interTranferReqest/getGatepass/#{id}',
    ASSIGN_ASSET: '/assign_asset/getGatepass/#{id}',
  },
  ASSET_REQUEST: {
    ALL: '/asset_request',
    BULK_CREATE: '/asset_request',
    BY_ID: '/asset_request/#{id}',
    ASSET_REQUEST_DISPATCH: '/assign_asset/status/#{id}',
    UPDATE_QUANTITY: '/asset_request/updateReqQuantity',
  },
  ASSET_TRANSFER: {
    INTER_DEPARTMENT_TRANSFER: '/interTranferReqest',
    INTER_DEPARTMENT_TRANSFER_NEW_STATUS: '/interTranferReqest/addNewStatus',
    INTER_DEPARTMENT_TRANSFER_STATUS: '/interTranferReqest/status/#{id}',
    REMOVAL: '/removal',
    GET_ITEMS_BY_CATEGORY: '/removal/getCbcByCategory/?category=#{category}',
    GET_ITEMS:
      '/asset-transfer-req/getItemsForAssetTransferReq?categoryId=#{categoryId}&type=#{type}',
    GET_ITEMS_BY_CATEGORY_REMOVAL:
      '/removal/getItemsForRemovalReqTranferReq?categoryId=#{categoryId}',
    ASSET_TRANSFER_REQUEST: '/asset-transfer-req',
  },
  ASSET_STATUS: {
    CREATE: '/requestStatus/create',
  },
  BRANCH: {
    ALL: '/branch',
    BY_ID: '/branch/#{id}',
  },
  BUILDINGS: {
    ALL: '/building/all',
  },
  FLOOR: {
    ALL: '/floor/all',
  },
  BUDGET: {
    ALL: '/budget',
    BUDGET_TYPE: '/budget/get_budget_types',
    BULK_CREATE: '/budget/bulk_upload',
    CREATE: '/budget',
    BUDGTE_BY_CATEGORY_AND_BRANCH:
      '/budget/budgetsByBranchCatType?branchId=#{branchId}&categoryId=#{categoryId}&budgetType=Branch',
  },
  COST_PER_UNIT: {
    BULK_CREATE: '/asset_category/createBulkCatFindByName',
    CREATE: '/asset_category/createCatFindByName',
    BULK_CREATE_CATEGORY: '/asset_category/categoryBulkUpload',
  },
  DEPARTMENTS: {
    ALL: '/department',
  },
  ITEMS: {
    ITMES_BY_DEPARTMENT_AND_GATEGORY:
      '/item/getItemsByDepartmentCatId?departmentId=#{departmentId}&catId=#{catId}',
    NOT_ASSIGNED_ITEMS_BY_CAT_ID: '/item/getNotAssignedItemsByCatId/#{catId}',
    ITMES_BY_DEPARTMENT_AND_GATEGORY_FOR_INTER_DEPARTMENT:
      '/interTranferReqest/getItemsForInterDepTranferReq?departmentId=#{departmentId}&categoryId=#{categoryId}',
  },
  USER: {
    BULK_CREATE: '/user/bulkCreate',
    SIGNIN: '/auth/signin',
    ALL_USERS: '/user/all',
    WHO_AM_I: '/user/whoAmI',
    ROLES: '/user/allRoles',
    RESET_PASSWORD: '/user/resetPassword',
  },
  REQUEST_STATUS: {
    STATUS_BY_REQTEST_ID: '/requestStatus/request/#{id}',
  },
  ASSIGN_ASSET: {
    ALL: 'asset_request/getAprovedAssetRequests',
    ASSIGN: '/assign_asset',
    GET_ITEMS: '/assign_asset/getItemsForAssignAssetReq',
  },
  TRANSFER: {
    SAVE_TRANSFER: '/transfer-req-status',
    STATUS: '/transfer-req-status/request/#{id}',
  },
  APPROVAL: {
    ASSET_REQUEST: '/approvals/assetRequests',
    ASSIGN_ASSET_REQUEST: '/approvals/assetAssignRequests',
    ASSET_TRANSFER_REQUEST: '/approvals/assetTransferRequests',
    INTER_DEPARMENT_TRANSFER_REQUEST: '/approvals/assetInterDepartmentTransferRequests',
    ASSET_REMOVAL_REQUEST: '/approvals/assetRemovalRequests',
    APPROVAL_COUNT: '/approvals/requestApprovalCount',
  },
  REMOVAL: {
    GET_STATUS: '/removal/status/#{id}',
    CREATE_STATUS: '/removal/createStatus',
  },
  REMINDER: {
    CREATE: '/remainder',
    GET: '/remainder/#{id}',
    UPDATE: '/remainder',
  },
  PO_GENERATION: {
    GET_POS: '/item/getUniquePoNums',
    GENERATE_CBC: '/item/generateCbcs',
    SET_SERIAL: '/item/saveManufactureSerial',
  },
};

export const MESSAGES = {
  COMMON: {
    ERRORS: {
      SOMETHING_WENT_WRONG: 'Something went wrong, please try again!',
      // eslint-disable-next-line quotes
      PERMISSION: "Don't have permission",
      PASSWORD: 'Password should be at least six characters long.',
    },
  },
};

export const getTagColorFromStatus = (currentStatus: string) => {
  // const status: {
  //   [status: string]: string;
  // } = {
  //   ACTIONS: 'gold',
  //   Initiate: 'gold',
  //   'More Info': 'magenta',
  //   Approved: 'blue',
  //   Reject: 'red',
  //   Dispatched: 'volcano',
  //   Received: 'green',
  //   'Received (Auto)': 'green',
  // };

  switch (currentStatus) {
    case ACTIONS.INIT: {
      return 'gold';
    }
    case ACTIONS.APPROVE: {
      return 'blue';
    }
    case ACTIONS.REJECT: {
      return 'red';
    }
    case ACTIONS.REQUEST_MORE: {
      return 'magenta';
    }
    case ACTIONS.GIVE_MORE: {
      return 'magenta';
    }
    case ACTIONS.PARTIAL_ASSIGN: {
      return 'volcano';
    }
    case ACTIONS.COMPLETE_ASSIGN: {
      return 'volcano';
    }
    case ACTIONS.COMPLETE: {
      return 'green';
    }
    default: {
      return 'gold';
    }
  }
};

export enum USER_ROLES {
  SUPER_ADMIN = 'Super_Admin',
  BRANCH_MANAGER = 'Branch_Manager',
  USER_DEPARTMENT_MANAGER = 'User_Department_Manager',
  BRANCH_USER = 'Branch_User',
  REGIONAL_MANAGER = 'Regional_Manager',
  USER_DEPARTMENT_USER = 'User_Department_User',
  CFO = 'CFO',
  BUDGET_ADMIN = 'Budget_Admin',
  USER_ADMIN = 'User_Admin',
  CONFIGURATION_ADMIN = 'Configuration_Admin',
  LINE_AGM_DGM = 'Line_AGM_DGM',
}

export const ACTIONS = {
  INIT: 'INIT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  REQUEST_MORE: 'REQUEST_MORE',
  GIVE_MORE: 'GIVE_MORE',
  PARTIAL_ASSIGN: 'PARTIAL_ASSIGN',
  COMPLETE_ASSIGN: 'COMPLETE_ASSIGN',
  COMPLETE: 'COMPLETE',
};

export const getColor = (action: string) => {
  switch (action) {
    case ACTIONS.INIT: {
      return '';
    }
    case ACTIONS.APPROVE: {
      return '';
    }
    case ACTIONS.REJECT: {
      return '';
    }
    case ACTIONS.REQUEST_MORE: {
      return '';
    }
    case ACTIONS.GIVE_MORE: {
      return '';
    }
    case ACTIONS.PARTIAL_ASSIGN: {
      return '';
    }
    case ACTIONS.COMPLETE_ASSIGN: {
      return '';
    }
    case ACTIONS.COMPLETE: {
      return '';
    }
    default: {
      return '';
    }
  }
};
