import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';

// simple cn util
const cn = (...c: Array<string | undefined | null | false>) => c.filter(Boolean).join(' ');

type CarouselContextType = {
  embla: EmblaCarouselType | undefined;
  viewportRef: (node: HTMLDivElement | null) => void;
};

const CarouselContext = React.createContext<CarouselContextType | null>(null);

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: EmblaOptionsType;
}

export const Carousel: React.FC<CarouselProps> = ({ className, children, opts, ...props }) => {
  const [viewportRef, embla] = useEmblaCarousel(opts);
  return (
    <CarouselContext.Provider value={{ embla, viewportRef }}>
      <div className={cn('relative', className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

export const CarouselContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  const ctx = React.useContext(CarouselContext);
  return (
    <div ref={ctx?.viewportRef} className={cn('overflow-hidden', className)} {...props}>
      <div className="-ml-4 flex touch-pan-y will-change-transform">
        {children}
      </div>
    </div>
  );
};

export const CarouselItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('min-w-0 shrink-0 grow-0 basis-full pl-4', className)} {...props}>
    {children}
  </div>
);

export const CarouselPrevious: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => {
  const ctx = React.useContext(CarouselContext);
  return (
    <button
      type="button"
      aria-label="Previous"
      onClick={() => ctx?.embla?.scrollPrev()}
      className={cn('absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded border bg-white/80 px-2 py-1 shadow', className)}
      {...props}
    >
      ‹
    </button>
  );
};

export const CarouselNext: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => {
  const ctx = React.useContext(CarouselContext);
  return (
    <button
      type="button"
      aria-label="Next"
      onClick={() => ctx?.embla?.scrollNext()}
      className={cn('absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded border bg-white/80 px-2 py-1 shadow', className)}
      {...props}
    >
      ›
    </button>
  );
};

export default Carousel;
