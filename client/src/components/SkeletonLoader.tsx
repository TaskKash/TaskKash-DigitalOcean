import { Card } from '@/components/ui/card';

export function CardSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    </Card>
  );
}

export function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function WalletPageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Balance Card Skeleton */}
      <Card className="p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </Card>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-6 bg-muted rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Profile Header Skeleton */}
      <Card className="p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </div>
      </Card>
      
      {/* Info Cards Skeleton */}
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Balance Card Skeleton */}
      <Card className="p-6 animate-pulse">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
          <div className="h-12 bg-muted rounded" />
        </div>
      </Card>
      
      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
      
      {/* Featured Tasks Skeleton */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
