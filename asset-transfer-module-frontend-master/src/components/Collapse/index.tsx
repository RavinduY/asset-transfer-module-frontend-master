import { FC } from 'react';
import { Collapse } from 'antd';

const { Panel } = Collapse;

interface CollapseItems {
  header: string;
  body: JSX.Element;
}

interface Props {
  items: CollapseItems[];
}

const CollapseComponent: FC<Props> = ({ items }): JSX.Element => {
  return (
    <Collapse accordion>
      {items?.map((item, i) => (
        <Panel header={item.header} key={i}>
          {item.body}
        </Panel>
      ))}
    </Collapse>
  );
};

export default CollapseComponent;
