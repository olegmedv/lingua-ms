import { useState } from 'react';
import { Alert } from 'antd';

export default function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Alert
      type="warning"
      showIcon
      closable
      message="Demo mode — your changes are not saved"
      afterClose={() => setDismissed(true)}
    />
  );
}
