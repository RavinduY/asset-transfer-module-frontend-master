import { FC, useEffect, useRef, useState } from 'react';
import { PDFExport } from '@progress/kendo-react-pdf';
import { Button, message } from 'antd';

import GatePassBody from '@/components/GatePass/GatePassBody';
import { HTTP_TYPES, MESSAGES } from '@/utils/constants';
import { useMutation } from '@/hooks/useMutate';

import './styles.scss';

interface PageTemplateProps {
  pageNum: number;
  totalPages: number;
}

const PageTemplate: FC<PageTemplateProps> = ({ pageNum, totalPages }): JSX.Element => {
  return (
    <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
      Page {pageNum} of {totalPages}
    </div>
  );
};

interface Props {
  url: string;
  visible: boolean;
  onAfterDownload: () => void;
  autoDownload?: boolean;
}

const GatePass: FC<Props> = ({ url, visible, onAfterDownload, autoDownload }): JSX.Element => {
  const [datas, setDatas] = useState([]);

  useEffect(() => {
    if (autoDownload) {
      handleDownloadGatepass();
    }
  }, []);

  const { mutate } = useMutation({
    url,
  });
  const pdfExportComponent = useRef<PDFExport>(null);

  const handleDownloadGatepass = async () => {
    try {
      const res = await mutate({}, HTTP_TYPES.GET);
      setDatas(res?.data?.data);
      setTimeout(() => {
        if (pdfExportComponent.current) {
          pdfExportComponent.current.save();
        }
        onAfterDownload();
      }, 1000);
    } catch (err) {
      message.error(MESSAGES.COMMON.ERRORS.SOMETHING_WENT_WRONG);
      return err;
    }
  };

  return (
    <div>
      {!autoDownload && (
        <Button
          disabled={!visible}
          style={{ color: 'white' }}
          className='button2'
          onClick={handleDownloadGatepass}
        >
          Download Gatepass
        </Button>
      )}
      <div style={{ position: 'absolute', left: '-100000px', top: -1000 }}>
        <PDFExport
          pageTemplate={PageTemplate}
          fileName='gatepass'
          paperSize='A4'
          margin='1cm'
          forcePageBreak='.page-break'
          ref={pdfExportComponent}
        >
          {datas?.map((data, index) => (
            <div key={index}>
              <GatePassBody
                type='Warehouse Copy'
                data={data}
                totalPages={datas.length * 4}
                page={index * 4 + 1}
              />
              <h3 className='page-break'></h3>
              <GatePassBody
                type='Branch Copy'
                data={data}
                totalPages={datas.length * 4}
                page={index * 4 + 2}
              />
              <h3 className='page-break'></h3>
              <GatePassBody
                type='Loading Copy'
                data={data}
                totalPages={datas.length * 4}
                page={index * 4 + 3}
              />
              <h3 className='page-break'></h3>
              <GatePassBody
                type='Stores Security Copy'
                data={data}
                totalPages={datas.length * 4}
                page={index * 4 + 4}
              />
              {datas?.length !== index + 1 && <h3 className='page-break'></h3>}
            </div>
          ))}
        </PDFExport>
      </div>
    </div>
  );
};

export default GatePass;
