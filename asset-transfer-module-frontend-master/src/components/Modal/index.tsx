import { FC } from 'react';
import { Modal } from 'antd';
import Spinner from '@/components/Spinner';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: JSX.Element;
  width?: number;
  title?: string;
  loading?: boolean;
}

const ModalComponent: FC<Props> = ({
  visible,
  onClose,
  children,
  width,
  title,
  loading,
}): JSX.Element => {
  return (
    <Modal
      title={title}
      visible={visible}
      footer={false}
      onCancel={onClose}
      width={width}
      maskClosable={false}
    >
      {loading ? <Spinner /> : children}
    </Modal>
  );
};

export default ModalComponent;
