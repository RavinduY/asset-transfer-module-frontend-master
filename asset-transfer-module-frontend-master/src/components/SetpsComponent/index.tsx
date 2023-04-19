import { FC } from 'react';
import { Steps } from 'antd';

const { Step } = Steps;

type StepStatus = 'error' | 'wait' | 'process' | 'finish' | undefined;

interface Props {
  status: StepStatus;
  current: number;
  steps: Steps[];
}

export interface Steps {
  title: string;
  description?: React.ReactNode;
}

const SetpsComponent: FC<Props> = ({ status, current, steps }): JSX.Element => {
  return (
    <Steps current={current} status={status} progressDot>
      {steps?.map((step, index) => (
        <Step key={index} title={step.title} description={step.description || ''} />
      ))}
    </Steps>
  );
};

export default SetpsComponent;
