import { Modal, Skeleton } from "@/shared/ui";

export default function ProductModalLoading() {
  return (
    <Modal className="max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-250 overflow-y-auto rounded-3xl sm:max-h-[calc(100dvh-48px)] sm:w-[calc(100vw-48px)]">
      <div className="flex flex-col bg-white lg:flex-row">
        <div className="flex min-h-64 items-center justify-center bg-white p-6 lg:min-h-[560px] lg:w-1/2">
          <Skeleton className="size-48 rounded-full bg-zinc-300/70 sm:size-64 lg:size-85" />
        </div>
        <div className="bg-[#F4F1EE] p-4 sm:p-6 lg:w-1/2 lg:p-10">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />

          <div className="mt-6 flex flex-col gap-3">
            <Skeleton className="h-11 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>

          <div className="mt-6">
            <Skeleton className="mb-3 h-6 w-44" />
            <div className="grid h-52 grid-cols-2 gap-2 overflow-hidden sm:grid-cols-3 lg:h-90">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))}
            </div>
          </div>

          <Skeleton className="mt-5 h-12 w-full rounded-2xl" />
        </div>
      </div>
    </Modal>
  );
}
