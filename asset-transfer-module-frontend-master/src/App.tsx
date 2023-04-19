import { useEffect } from 'react';
import Routes from '@/Routes';
import { useAppDispatch } from '@/hooks/useRedux';
import { checkUser } from '@/store/user';

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkUser());
  }, []);

  return (
    <div className='App'>
      <Routes />
    </div>
  );
};

export default App;
