import { FC } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { mapPathNameToBreadcrumb, ROUTES } from '@/utils/constants';
import { HomeOutlined } from '@ant-design/icons';

import './styles.scss';

const BreadcrumbComponent: FC = (): JSX.Element => {
  const { pathname } = useLocation();
  const { path, name } = mapPathNameToBreadcrumb(pathname);

  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/' ? true : false;

  return (
    <div className='Breadcrumb'>
      <div className='breadcrumbs'>
        <ul className='steps'>
          <li
            className={`${isHome ? 'step-active' : 'step'}`}
            onClick={() => navigate(ROUTES.HOME)}
          >
            <Link to={ROUTES.HOME}>
              <HomeOutlined />
            </Link>
          </li>
          {name && (
            <li className={`${!isHome ? 'step-active' : 'step'}`} onClick={() => navigate(path)}>
              {name}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default BreadcrumbComponent;
