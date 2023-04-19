import { useMutation } from '@/hooks/useMutate';
import { HTTP_TYPES } from '@/utils/constants';
import { Button } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import GatePassBody from './GatePassBody';

interface Props {
  url: string;
  visible: boolean;
  onAfterDownload: () => void;
  autoDownload?: boolean;
  buttonText?: string;
}

const ReprintGatePass: FC<Props> = ({
  buttonText,
  url,
  visible,
  onAfterDownload,
  autoDownload,
}) => {
  const [datas, setDatas] = useState([]);

  const { mutate } = useMutation({
    url,
  });
  const buttonRef = useRef(null);

  const handleDownloadGatepass = async () => {
    try {
      const res = await mutate({}, HTTP_TYPES.GET);
      setDatas(res?.data?.data);
      setTimeout(() => {
        if (buttonRef.current) {
          //    @ts-ignore
          buttonRef.current.click();
        }
        onAfterDownload();
      }, 1000);
    } catch (err) {
      return err;
    }
  };

  useEffect(() => {
    if (autoDownload) {
      handleDownloadGatepass();
    }
  }, []);

  const componentRef = useRef(null);

  const onBeforeGetContentResolve = useRef(null);

  const handleAfterPrint = useCallback(() => {
    console.log('`onAfterPrint` called');
  }, []);

  const handleBeforePrint = useCallback(() => {
    console.log('`onBeforePrint` called');
  }, []);

  useEffect(() => {
    // this is needed
  }, [onBeforeGetContentResolve.current]);

  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, [componentRef.current]);

  const reactToPrintTrigger = useCallback(() => {
    // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
    // to the root node of the returned component as it will be overwritten.

    // Bad: the `onClick` here will be overwritten by `react-to-print`
    // return <button onClick={() => alert('This will not work')}>Print this out!</button>;

    // Good
    return (
      <button className='show-on-print' ref={buttonRef}>
        Print using a Functional Component
      </button>
    );
  }, []);

  return (
    <div>
      {!autoDownload && (
        <Button
          disabled={!visible}
          style={{ color: 'white', marginBottom: 10 }}
          className='button2'
          onClick={handleDownloadGatepass}
        >
          {buttonText || 'Download Gatepass'}
        </Button>
      )}
      <ReactToPrint
        content={reactToPrintContent}
        documentTitle='gatepass'
        onAfterPrint={handleAfterPrint}
        onBeforePrint={handleBeforePrint}
        removeAfterPrint
        trigger={reactToPrintTrigger}
      />
      <div ref={componentRef}>
        {datas?.map((data, index) => (
          <div key={index} className='show-on-print'>
            <GatePassBody
              type='Warehouse Copy'
              data={data}
              isReprint={true}
              totalPages={datas.length * 4}
              page={index * 4 + 1}
            />
            <h3 className='page-break'></h3>
            <GatePassBody
              type='Branch Copy'
              data={data}
              isReprint={true}
              totalPages={datas.length * 4}
              page={index * 4 + 2}
            />
            <h3 className='page-break'></h3>
            <GatePassBody
              type='Loading Copy'
              data={data}
              isReprint={true}
              totalPages={datas.length * 4}
              page={index * 4 + 3}
            />
            <h3 className='page-break'></h3>
            <GatePassBody
              type='Stores Security Copy'
              data={data}
              isReprint={true}
              totalPages={datas.length * 4}
              page={index * 4 + 4}
            />
            {datas?.length !== index + 1 && <h3 className='page-break'></h3>}
          </div>
        ))}
      </div>
    </div>
  );
};
export default ReprintGatePass;
