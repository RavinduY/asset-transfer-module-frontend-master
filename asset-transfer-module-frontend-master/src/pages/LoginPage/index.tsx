/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import InputComponent from '@/components/Form/Input';

import { useMutation } from '@/hooks/useMutate';
import { ACCESS_TOKEN, API_ROUTES } from '@/utils/constants';
import { withUnAuth } from '@/components/Hoc/withUnauth/withUnauth';
// @ts-ignore
import backgroundImage from '@/assets/login.jpg';
// @ts-ignore
import logo from '@/assets/com_bank.png';

import './styles.scss';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username required'),
  password: Yup.string().min(6, 'Too Short!').max(50, 'Too Long!').required('Password required'),
});

const Login: FC = (): JSX.Element => {
  const { mutate, loading } = useMutation({
    url: API_ROUTES.USER.SIGNIN,
  });

  const loginUser = async (values: object) => {
    const res = await mutate(values);
    if (res.success) {
      localStorage.setItem(ACCESS_TOKEN, res.data?.accessToken);
      window.location.replace('/');
    } else {
      formik.errors.username = 'Invalid Credentials';
      formik.errors.password = 'Invalid Credentials';
    }
  };

  const formik = useFormik({
    validationSchema,
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: loginUser,
  });

  return (
    <div
      className='LoginPage'
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className='form'>
        <img className='company-logo' src={logo} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            formik.handleSubmit();
          }}
          className='items'
        >
          <InputComponent
            id='username'
            name='username'
            value={formik.values.username}
            touched={!!formik.touched.username}
            onChange={formik.handleChange}
            error={formik.errors.username}
            onBlur={formik.handleBlur}
            placeHolder='Enter Username'
          />
          <InputComponent
            id='password'
            name='password'
            value={formik.values.password}
            touched={!!formik.touched.password}
            onChange={formik.handleChange}
            error={formik.errors.password}
            onBlur={formik.handleBlur}
            type='password'
            placeHolder='Enter Password'
          />
          <button disabled={loading} type='submit' className='loginButton'>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default withUnAuth(Login);
