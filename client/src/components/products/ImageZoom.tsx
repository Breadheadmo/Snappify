import React, { useRef, useState } from 'react';

type Props = {
  src: string;
  alt?: string;
  zoom?: number; // magnification level
  zoomPaneSize?: number; // px size of the zoom window (md+ only)
  position?: 'auto' | 'left' | 'right'; // where to render the pane relative to image
  className?: string;
};

// Lightweight zoom-on-hover with a side preview pane (desktop only)
const ImageZoom: React.FC<Props> = ({
  src,
  alt = 'image',
  zoom = 2.5,
  zoomPaneSize = 448, // 28rem square by default (less tall than before)
  position = 'auto',
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showZoom, setShowZoom] = useState(false);
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 });
  const [placeLeft, setPlaceLeft] = useState(false);
  const [paneSize, setPaneSize] = useState<number>(zoomPaneSize);

  const onMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBgPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });

    // decide side + size without compromising layout
    const margin = 16; // px gap from image
    const availableRight = Math.max(0, window.innerWidth - rect.right - margin);
    const availableLeft = Math.max(0, rect.left - margin);

    let useLeft = position === 'left';
    if (position === 'right') useLeft = false;
    if (position === 'auto') {
      useLeft = availableRight < zoomPaneSize && availableLeft > availableRight;
    }
    setPlaceLeft(useLeft);

    const space = useLeft ? availableLeft : availableRight;
    const desired = zoomPaneSize;
    const minSize = 256; // don't go smaller than 16rem
    const size = Math.max(minSize, Math.min(desired, space));
    setPaneSize(size);
  };

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <div
        ref={containerRef}
        className="w-full h-full"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={onMove}
      >
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full rounded-lg select-none"
          draggable={false}
        />
      </div>

      {/* Zoom pane (hidden on small screens) */}
      {showZoom && (
        <div
          className="hidden md:block absolute rounded-lg shadow-lg border border-gray-200 bg-white overflow-hidden z-20"
          style={{
            width: paneSize,
            height: paneSize, // exact square
            top: '50%',
            right: placeLeft ? undefined : 0,
            left: placeLeft ? 0 : undefined,
            transform: `translate(${placeLeft ? '-100%' : '100%'}, -50%)`, // horizontal + vertical center
            marginLeft: placeLeft ? undefined : 12,
            marginRight: placeLeft ? 12 : undefined,
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
            backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
          }}
        />
      )}
    </div>
  );
};

export default ImageZoom;
