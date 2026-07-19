import { Separator } from '@/components/ui/separator';
import { PaymentHistorySection } from './sections/PaymentHistorySection';
import { ProfileSection } from './sections/ProfileSection';
import { SubscriptionSection } from './sections/SubscriptionSection';

export function AccountPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <ProfileSection />
      <Separator />
      <SubscriptionSection />
      <Separator />
      <PaymentHistorySection />
    </div>
  );
}
