/* eslint-disable no-unused-vars*/
import React, { FC } from 'react';
import { Input } from 'antd';

import './styles.scss';

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent) => void;
  error?: string | null;
  className?: string;
  type?: string;
  label?: string;
  placeHolder: string;
  id: string;
  name: string;
  touched: boolean;
  onBlur?: (e: React.FocusEvent) => void;
  wrapperClass?: string;
  readonly?: boolean;
  disabled?: boolean;
  secret?: boolean;
}

const InputComponent: FC<Props> = ({
  type,
  placeHolder,
  id,
  name,
  touched,
  error,
  value,
  onChange,
  onBlur,
  wrapperClass,
  readonly,
  disabled,
  secret,
}): JSX.Element => {
  return (
    <div className={`InputComponent ${wrapperClass}`}>
      {readonly ? (
        <span>{value}</span>
      ) : secret ? (
        <Input.Password
          style={{ marginTop: '5px', marginBottom: '5px' }}
          className='w-10'
          id={id}
          name={name}
          disabled={disabled}
          placeholder={placeHolder}
          onBlur={onBlur}
          onChange={onChange}
          value={value}
          type={type}
        />
      ) : (
        <>
          <Input
            style={{ marginTop: '5px', marginBottom: '5px' }}
            className='w-10'
            id={id}
            name={name}
            disabled={disabled}
            placeholder={placeHolder}
            onBlur={onBlur}
            onChange={onChange}
            value={value}
            type={type}
          />
          {touched && <span className='error'>{error}</span>}
        </>
      )}
    </div>
  );
};

export default InputComponent;
