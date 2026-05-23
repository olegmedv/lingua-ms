import { Alert } from 'antd';
import { useIsDemoUser } from '../../hooks/useIsDemoUser';
import { useUiStore } from '../../store/ui';

export default function DemoAdminBanner() {
  const isDemo = useIsDemoUser();
  const dismissed = useUiStore(state => state.adminDemoBannerDismissed);
  const dismiss = useUiStore(state => state.dismissAdminDemoBanner);

  if (!isDemo || dismissed) return null;

  return (
    <Alert
      type="warning"
      showIcon
      closable
      message="Demo mode — changes are not saved"
      onClose={dismiss}
    />
  );
}
