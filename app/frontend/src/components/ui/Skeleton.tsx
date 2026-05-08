import { cn } from '@/lib/utils'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-white/5",
        className
      )}
      {...props}
    />
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number, cols?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex gap-4 mb-4">
         {Array.from({ length: cols }).map((_, i) => (
           <Skeleton key={i} className="h-4 flex-1" />
         ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2 border-b border-gray-100 dark:border-white/5">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="w-80 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl space-y-3 h-[400px]">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full opacity-50" />
          </div>
        </div>
      ))}
    </div>
  )
}
