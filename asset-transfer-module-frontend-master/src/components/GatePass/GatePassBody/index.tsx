/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from '@/hooks/useRedux';
import { orderBy } from 'lodash';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';

import './styles.scss';

type GatePassType = 'Warehouse Copy' | 'Branch Copy' | 'Loading Copy' | 'Stores Security Copy';

interface Props {
  type: GatePassType;
  data: any;
  isReprint?: boolean;
  totalPages: number;
  page: number;
  isFirst?: boolean;
}

const GatePassBody: FC<Props> = ({
  type,
  data,
  isReprint,
  page,
  totalPages,
  isFirst,
}): JSX.Element => {
  const { user } = useAppSelector((store) => store.user);
  const [items, setItems] = useState(data?.items);

  if (!data) {
    return <></>;
  }

  useEffect(() => {
    setItems(orderBy(items, [(item) => item.name.toLowerCase()], ['desc']));
  }, []);

  return (
    <div className={`GatePassBody ${isFirst ? 'reduceHeight' : ''}`}>
      <div className='pdf-header'>
        <div className='text'>
          Commercial Bank of Ceylon PLC
          <br />
          Asset Transfer Gate Pass
        </div>
      </div>
      <div className='center'>
        <div className='center'>
          <b>Copy</b> : {type} <div className='reprint'>{isReprint ? ' (Reprint)' : ''}</div>
        </div>
      </div>
      <div className='table1'>
        <div className='tableBorder bold'>Gate Pass Number</div>
        <div className='tableBorderNoLeft'>{data?.gatePassId || ''}</div>
        <div className='tableBorderNoLeft bold'>Printed Date</div>
        <div className='tableBorderNoLeft'>{moment(new Date()).format('DD-MM-YYYY')}</div>
      </div>
      <div className='table1'>
        <div className='tableBorderNoTop bold'>Created By Position</div>
        <div className='tableBorderNoLeftNoTop'>
          {user?.firstName || ''}{' '}
          <span style={{ marginLeft: '10px' }}>
            {user?.branch?.name || user?.department?.name || ''}
          </span>
        </div>
        <div className='tableBorderNoLeftNoTop bold'>Transfer Type</div>
        <div className='tableBorderNoLeftNoTop'>{data?.transferType || ''}</div>
      </div>
      <div className='table1'>
        <div className='tableBorderNoTop bold'>From Branch</div>
        <div className='tableBorderNoLeftNoTop bold'>{data?.fromBranchName || 'Unspecified'}</div>
        <div className='tableBorderNoLeftNoTop bold'>From Department</div>
        <div className='tableBorderNoLeftNoTop bold'>
          {data?.fromDepartmentName || 'Unspecified'}
        </div>
      </div>
      <div className='table1'>
        <div className='tableBorderNoTop bold'>To Branch</div>
        <div className='tableBorderNoLeftNoTop bold'>{data?.toBranchName || 'Unspecified'}</div>
        <div className='tableBorderNoLeftNoTop bold'>Printed Date</div>
        <div className='tableBorderNoLeftNoTop'>{moment(new Date()).format('DD-MM-YYYY')}</div>
      </div>
      <div className='table1'>
        <div className='tableBorderNoTop bold'>Special Remarks</div>
        <div className='tableBorderNoLeftNoTopNoRight'>{data?.remarks || ''}</div>
        <div className='tableBorderNoLeftNoTopNoRight'></div>
        <div className='tableBorderNoLeftNoTop'></div>
      </div>

      <div className='table2 table1 table3'>
        <table>
          <thead>
            <th>No</th>

            <th>Barcode Number</th>

            <th>Description</th>

            <th>MF Serial No</th>

            <th>Remarks</th>

            <th>Need By Date</th>
          </thead>
          <tbody>
            {items?.map((item: any, index: number) => {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>

                  <td>{item?.cbc}</td>

                  <td>{item?.name}</td>

                  <td>{item?.manufactureSerial}</td>

                  <td>{item?.remark}</td>

                  <td>
                    {item?.neededDate
                      ? moment(new Date(item?.neededDate)).format('DD-MMM-YY')
                      : moment(new Date()).format('DD-MMM-YY')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className='table2 table1 table3'>
        <div className='tableBorderNoLeftNoTop bold'></div>
        <div className='tableBorderNoLeft bold'>Name</div>
        <div className='tableBorderNoLeft bold'>Signature</div>
        <div className='tableBorderNoLeft bold'>Date & Time</div>
      </div>
      <div className='table1'>
        <div className='tableBorderNoTop bold'>Delivery Person</div>
        <div className='tableBorderNoLeftNoTop'></div>
        <div className='tableBorderNoLeftNoTop bold'></div>
        <div className='tableBorderNoLeftNoTop'></div>
      </div>
      <div className='table1'>
        <div className='tableBorderNoTop bold'>Authorized By Manager/HOD</div>
        <div className='tableBorderNoLeftNoTop'></div>
        <div className='tableBorderNoLeftNoTop bold'></div>
        <div className='tableBorderNoLeftNoTop'></div>
      </div>
      <div className='table1'>
        <div className='tableBorderNoTop bold'>Recipient</div>
        <div className='tableBorderNoLeftNoTop'></div>
        <div className='tableBorderNoLeftNoTop bold'></div>
        <div className='tableBorderNoLeftNoTop'></div>
      </div>

      <div className='table2 table1 table3'>
        <table>
          <thead>
            <th>Begin Date</th>

            <th>Status</th>

            <th>From User</th>

            <th>To User</th>

            <th>User Comments</th>
          </thead>
          <tbody>
            {data?.statusList?.map((list: any, index: number) => (
              <tr key={index}>
                <td>{moment(new Date(list?.date || '')).format('DD-MMM-YYYY HH:MM:SS')}</td>
                <td style={{ textTransform: 'uppercase' }}>{list?.status}</td>
                <td>{list?.fromUser?.firstName || ''}</td>
                <td>{list?.toUser?.firstName || ''}</td>
                <td>{list?.comment || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isReprint && (
        <img
          src='https://t4.ftcdn.net/jpg/02/88/15/69/360_F_288156958_lIThOMV0RAybg8l8Gd62LZdvWhfCnKUO.jpg'
          alt=''
          className='watermark'
        />
      )}
      <div className='condition'>
        <div>Internal Banks use only</div>
        <div>
          page {page} of {totalPages}
        </div>
      </div>
    </div>
  );
};

export default GatePassBody;
