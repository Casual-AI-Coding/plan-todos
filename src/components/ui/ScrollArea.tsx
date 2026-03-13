import {
  type HTMLAttributes,
  forwardRef,
  useRef,
  useEffect,
  useState,
} from "react";

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    { className = "", children, viewportClassName = "", style, ...props },
    ref,
  ) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollbar, setShowScrollbar] = useState(false);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      const handleScroll = () => {
        setShowScrollbar(el.scrollHeight > el.clientHeight);
      };

      el.addEventListener("scroll", handleScroll);
      handleScroll();

      return () => el.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden ${className}`}
        style={style}
        {...props}
      >
        <div
          ref={scrollRef}
          className={`h-full w-full overflow-auto ${viewportClassName}`}
        >
          {children}
        </div>
        {showScrollbar && (
          <div className="absolute right-1 top-0 bottom-0 w-2 bg-transparent">
            <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-full opacity-50" />
          </div>
        )}
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";
