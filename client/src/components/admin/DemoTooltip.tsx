import { Tooltip } from 'antd';
import { useIsDemoUser } from '../../hooks/useIsDemoUser';

interface Props {
  children: React.ReactNode;
}

export default function DemoTooltip({ children }: Props) {
  const isDemo = useIsDemoUser();
  if (!isDemo) return <>{children}</>;
  return (
    <Tooltip title="Demo cannot modify">
      <span style={{ display: 'inline-block' }}>{children}</span>
    </Tooltip>
  );
}
