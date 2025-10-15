import React, { useEffect, useMemo, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '../types/Product';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

type Props = {
  products: Product[];
  autoPlayMs?: number;
  title?: string;
  subtitle?: string;
};

const PopularCarousel: React.FC<Props> = ({
  products,
  autoPlayMs = 2000,
  title = 'Popular Now',
  subtitle = 'Trending products customers love',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { addToCart } = useCart();

  const items = useMemo(() => products || [], [products]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = containerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9; // move almost a page
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!autoPlayMs) return;
    const el = containerRef.current;
    if (!el) return;
    let timer: number | undefined;
    const start = () => {
      stop();
      timer = window.setInterval(() => {
        if (!el) return;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
        if (atEnd) {
          el.scrollTo({ left: 0, behavior: 'auto' });
        } else {
          el.scrollBy({ left: el.clientWidth * 0.9, behavior: 'smooth' });
        }
      }, autoPlayMs);
    };
    const stop = () => {
      if (timer) window.clearInterval(timer);
    };
    if (!isHovering) start();
    return () => stop();
  }, [autoPlayMs, isHovering]);

  if (!items.length) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="hidden md:flex gap-2">
            <button aria-label="Previous" onClick={() => scrollByPage(-1)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button aria-label="Next" onClick={() => scrollByPage(1)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />

          <div
            ref={containerRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar"
          >
            {items.map((product) => (
              <div
                key={product.id || (product as any)._id}
                className="snap-start flex-shrink-0 basis-[85%] sm:basis-[60%] md:basis-1/2 lg:basis-1/4"
              >
                <ProductCard product={product} onAddToCart={addToCart} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularCarousel;
