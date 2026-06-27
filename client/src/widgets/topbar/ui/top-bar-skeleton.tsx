import { Container, Skeleton } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

interface Props {
  className?: string;
  isScroll?: boolean;
}

const categoryWidths = [
  "md:w-16",
  "md:w-22",
  "md:w-24",
  "md:w-20",
  "md:w-28",
  "md:w-23",
];

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
      <Container className="flex min-w-0 items-center justify-between">
        <div
          className={cn(
            "flex min-w-0 w-full items-center gap-1 overflow-hidden rounded-2xl bg-gray-50 p-1 shadow-md md:w-auto md:justify-start",
            isScroll && "bg-transparent shadow-none",
          )}
        >
          {categoryWidths.map((widthClassName, index) => (
            <Skeleton
              key={index}
              className={cn(
                "h-8 shrink-0 rounded-xl md:h-10",
                index === 0 && "w-10",
                index === 1 && "w-16",
                index === 2 && "w-16",
                index === 3 && "w-18",
                index === 4 && "w-28",
                index === 5 && "w-20",
                widthClassName,
              )}
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
