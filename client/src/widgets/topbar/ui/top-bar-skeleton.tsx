import { Container, Skeleton } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

interface Props {
  className?: string;
  isScroll?: boolean;
}

export const TopBarSkeleton = ({ className, isScroll }: Props) => {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 transition-all duration-300",
        isScroll
          ? "bg-white/80 backdrop-blur-lg shadow-sm py-2"
          : "bg-transparent shadow-none py-3",
        className,
      )}
    >
      <Container className="flex items-center justify-between">
        <div
          className={cn(
            "w-full md:w-auto md:inline-flex items-center gap-1 p-1 rounded-2xl bg-gray-50 shadow-md",
            isScroll && "bg-transparent shadow-none",
          )}
        >
          {[64, 88, 96, 80, 112, 92].map((width, index) => (
            <Skeleton
              key={index}
              className="h-10"
              style={{ width }}
            />
          ))}
        </div>
        <Skeleton
          className={cn(
            "hidden md:block h-12 w-52 rounded-2xl shadow-md",
            isScroll && "bg-transparent shadow-none",
          )}
        />
      </Container>
    </div>
  );
};
