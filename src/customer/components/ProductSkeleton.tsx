import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-[18px] px-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-brand-cream rounded-card border-[1.5px] border-brand-border h-[340px] flex flex-col justify-start gap-2 p-3"
        >
          <Skeleton className="w-full h-[170px] rounded-lg" />
          <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
          <Skeleton className="h-3 w-full mt-1" />
          <Skeleton className="h-3 w-2/3 mt-1" />
          <Skeleton className="h-5 w-1/3 mx-auto mt-2" />
          <Skeleton className="h-8 w-24 mx-auto mt-2 rounded-full" />
        </div>
      ))}
    </div>
  );
}
