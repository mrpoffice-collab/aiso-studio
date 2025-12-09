import { SubscriptionProvider } from '@/hooks/useSubscription';
import DashboardWrapper from '@/components/DashboardWrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubscriptionProvider>
      <DashboardWrapper>
        {children}
      </DashboardWrapper>
    </SubscriptionProvider>
  );
}
