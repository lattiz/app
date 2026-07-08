import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Metrics row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      {/* Two-col cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Skeleton className="h-36 rounded-lg" />
        <Skeleton className="h-36 rounded-lg" />
      </div>
      {/* Sub card */}
      <Skeleton className="h-28 rounded-lg" />
    </div>
  );
}
