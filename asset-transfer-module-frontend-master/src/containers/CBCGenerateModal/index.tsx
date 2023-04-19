/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Input, message } from 'antd';
import { FC, useEffect, useState } from 'react';

import CollapseComponent from '@/components/Collapse';
import { ColumnsType } from 'antd/lib/table';
import ModalComponent from '@/components/Modal';
import TableComponent from '@/containers/Table';
import { API_ROUTES, MESSAGES } from '@/utils/constants';
import { useQuery } from '@/hooks/useQuery';
import { groupBy, sortBy } from 'lodash';
import { useMutation } from '@/hooks/useMutate';

import './styles.scss';

interface Props {
  poOrGrn: string;
  po: string;
  grn: string;
}

interface ItemDetail {
  cbc: string;
  manufactureSerial: string;
  manufactureSerialDisabled?: boolean;
}

interface Item {
  header: string;
  details: ItemDetail[];
}

const CBCGenerateModal: FC<Props> = ({ poOrGrn, po, grn }): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const [isCbcGenerated, setIsCbcGenerated] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const { data, retry } = useQuery({
    url: `${API_ROUTES.PO_GENERATION.GENERATE_CBC}?po=${po}&grn=${grn}`,
    notFetchOnLoad: true,
  });

  const [cbcsAndSerial, setCbcsAndSerial] = useState<ItemDetail[]>([]);

  const onSerialChange = (value: string, cbc: string) => {
    const otherCbcsAndSerials: ItemDetail[] = cbcsAndSerial.filter((da) => da.cbc !== cbc);
    const cbcAndSerial = cbcsAndSerial.find((da) => da.cbc === cbc);
    if (cbcAndSerial) {
      setCbcsAndSerial([...otherCbcsAndSerials, { ...cbcAndSerial, manufactureSerial: value }]);
    }
  };

  const columns: ColumnsType<object> = [
    {
      title: 'CBC#',
      dataIndex: 'cbc',
      key: 'cbc',
    },
    {
      title: 'Manufacture Serial',
      dataIndex: 'manufactureSerial',
      key: 'manufactureSerial',
      render: (_: string, data: any) => {
        return (
          <Input
            disabled={data.manufactureSerialDisabled}
            value={cbcsAndSerial.find((da) => da.cbc === data.cbc)?.manufactureSerial || ''}
            onChange={(e) => onSerialChange(e.target.value, data.cbc)}
          />
        );
      },
    },
  ];

  const { loading, mutate } = useMutation({
    url: API_ROUTES.PO_GENERATION.SET_SERIAL,
  });

  const handleSaveClick = async () => {
    try {
      const res = await mutate(
        cbcsAndSerial?.map((data) => ({
          manufactureSerial: data?.manufactureSerial,
          cbc: data?.cbc,
        })),
      );
      if (res.success) {
        message.success('Serial Number saved successfully');
        await retry();
        return;
      }
      message.error(MESSAGES.COMMON.ERRORS.PERMISSION);
    } catch (err) {
      return err;
    }
  };

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const itemsByCategory = groupBy(data, (item: any) => item?.categoryName);
      const keys = Object.keys(itemsByCategory);
      const values = Object.values(itemsByCategory);

      const itemDetails: any[] = [];

      values.forEach((value) => {
        value.forEach((item) => {
          itemDetails.push({
            ...item,
            manufactureSerialDisabled: !!item.manufactureSerial,
          });
        });
      });
      const items: any = [];
      keys.forEach((key, index) => {
        items.push({
          header: key,
          details: sortBy(
            Object.values(itemsByCategory)[index].map((ic) => ({
              ...ic,
              manufactureSerialDisabled: !!ic.manufactureSerial,
            })),
            'poNum',
          ),
        });
      });
      setItems(items);
      setIsCbcGenerated(true);
      setCbcsAndSerial(itemDetails);
    }
  }, [data]);

  return (
    <div className='CBCGenerateModal'>
      <div onClick={() => setVisible(true)}>{poOrGrn}</div>
      <ModalComponent
        visible={visible}
        onClose={() => setVisible(false)}
        title='CBC Generation'
        width={800}
      >
        <div className='generate-cbc-body'>
          <div className='generate-cbc'>
            <div className='po'>
              PO: <span>{po}</span>
            </div>
            <div className='grn'>
              GRN: <span>{grn}</span>
            </div>
            <Button disabled={loading} className='button3' onClick={retry}>
              Generate CBC
            </Button>
          </div>
          {isCbcGenerated && (
            <div className='cbc-collapse'>
              <CollapseComponent
                items={[
                  ...(items?.map((item) => ({
                    header: `${item.header} ${item?.details?.length || 0}`,
                    body: (
                      <TableComponent
                        columns={columns}
                        data={item.details?.map((detail) => ({ key: detail.cbc, ...detail }))}
                      />
                    ),
                  })) || []),
                ]}
              />
            </div>
          )}

          {!!items.length && (
            <Button disabled={loading} className='button2 save-btn' onClick={handleSaveClick}>
              Save
            </Button>
          )}
        </div>
      </ModalComponent>
    </div>
  );
};

export default CBCGenerateModal;
