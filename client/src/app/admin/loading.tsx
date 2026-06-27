import { Skeleton } from "@/shared/ui";

export default function AdminLoading() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-80 rounded-lg" />
    </div>
  );
}
