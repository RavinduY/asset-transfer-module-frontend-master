/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Upload, UploadProps } from 'antd';
import { RcFile } from 'antd/lib/upload';

import './styles.scss';

const { Dragger } = Upload;

interface Props {
  title: string;
  description: string;
  beforeUpload?: (file: RcFile) => boolean;
  onChange: (file: File) => void;
}

const FileDragger: FC<Props> = ({ title, description, beforeUpload, onChange }) => {
  const props: UploadProps = {
    multiple: false,
    accept: '',
    showUploadList: false,
    beforeUpload,
    // @ts-ignore
    onChange(info: { file: { originFileObj: File } }) {
      onChange(info?.file?.originFileObj);
    },
  };

  return (
    <Dragger {...props}>
      <p className='ant-upload-drag-icon'>
        <InboxOutlined />
      </p>
      <p className='ant-upload-text'>{title}</p>
      <p className='ant-upload-hint'>{description}</p>
    </Dragger>
  );
};

export default FileDragger;
