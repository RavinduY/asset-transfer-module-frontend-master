import { FC } from 'react';
import { AssetRequest } from '@/pages/AssertRequestPage';
import { Button } from 'antd';

import './styles.scss';

interface Props {
  asset?: AssetRequest;
  onCancel: () => void;
}

const AssetRequestModal: FC<Props> = ({ asset, onCancel }): JSX.Element => {
  const getTotal = () => {
    let total = 0;
    asset?.requestItems?.forEach((item) => {
      total += item.costPerUnits * item.quantity;
    });

    return total;
  };

  return (
    <div className='AssetRequestModal'>
      <div className='user-branch'>
        <div className='initiator'>
          Initiator: <span>{asset?.user.userName}</span>
        </div>
        <div className='location'>
          Location: <span>{asset?.branchTo?.name}</span>
        </div>
      </div>
      <div className='items'>
        {asset?.requestItems?.map((item) => (
          <div key={item.id} className='item'>
            <div className='category'>{item.categoryName}</div>
            {/* @ts-ignore */}
            {item.remarks && <div className='category'>- Remarks: {item.remarks}</div>}
            <div className='quantity'>- Requested: {item.quantity}</div>
            <div className='cost-per-unit'>- Cost: {item.costPerUnits * item.quantity}</div>
          </div>
        ))}
      </div>
      <div className='total'>Total - {getTotal()}</div>
      <Button className='close button5' onClick={onCancel}>
        Close
      </Button>
    </div>
  );
};

export default AssetRequestModal;
