import React, { useRef, useState, useEffect } from 'react';
import { WearLevel } from '../types';
import { RETRO_STICKERS } from '../data/songs';

interface StickerAndWearProps {
  stickerId: string | null;
  stickerX: number;
  stickerY: number;
  wearLevel: WearLevel;
  onMoveSticker?: (x: number, y: number) => void;
}

export const StickerAndWear: React.FC<StickerAndWearProps> = ({
  stickerId,
  stickerX,
  stickerY,
  wearLevel,
  onMoveSticker,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const selectedSticker = RETRO_STICKERS.find((s) => s.id === stickerId);

  // Drag and drop sticker placement relative to container
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging || !onMoveSticker || !containerRef.current) return;

    const handleMove = (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      
      // Calculate percentage inside boundaries [0, 100]
      const rawX = ((clientX - rect.left) / rect.width) * 100;
      const rawY = ((clientY - rect.top) / rect.height) * 100;
      const x = Math.max(0, Math.min(100, Math.round(rawX)));
      const y = Math.max(0, Math.min(100, Math.round(rawY)));
      
      onMoveSticker(x, y);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, onMoveSticker]);

  // Click container to teleport sticker if click occurs within bounding box
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMoveSticker || isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onMoveSticker(x, y);
  };

  // Dispatch a CustomEvent for sticker removal that App.tsx can capture instantly
  const handleRemoveSticker = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Dispatch instant global event to clear active sticker
    const event = new CustomEvent('retro_clear_sticker');
    window.dispatchEvent(event);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      onClick={handleContainerClick}
    >
      {/* Stickers */}
      {selectedSticker && (
        <div
          className={`absolute select-none transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto filter drop-shadow-md cursor-grab active:cursor-grabbing hover:scale-105 group/sticker ${
            isDragging ? 'scale-110 !cursor-grabbing' : 'transition-all duration-150'
          }`}
          style={{
            left: `${stickerX}%`,
            top: `${stickerY}%`,
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          title="Trascina per spostare o clicca sulla '✕' per rimuovere!"
        >
          <div className="relative bg-white/95 border-2 border-[#141414] p-1 rounded-full shadow-md flex items-center justify-center w-12 h-12 hover:rotate-6 transition-transform">
            <span className="text-3xl">{selectedSticker.emoji}</span>
            
            {/* Quick deletion badge directly on top of sticker element */}
            <button
              onClick={handleRemoveSticker}
              onTouchStart={(e) => e.stopPropagation()} // Prevent microtouch fire
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#A52A2A] border-2 border-[#141414] text-white rounded-full flex items-center justify-center text-[9px] font-black cursor-pointer shadow-xs hover:scale-110 transition-transform pointer-events-auto"
              title="Rimuovi adesivo"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Scratches and Rust Effects */}
      {wearLevel === 'used' && (
        <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Subtle scratches */}
          <line x1="10" y1="10" x2="15" y2="25" stroke="#4a4a4a" strokeWidth="0.25" strokeLinecap="round" />
          <line x1="80" y1="75" x2="85" y2="70" stroke="#4a4a4a" strokeWidth="0.2" strokeLinecap="round" />
          <line x1="20" y1="85" x2="35" y2="88" stroke="#ffffff" strokeWidth="0.15" strokeLinecap="round" />
        </svg>
      )}

      {wearLevel === 'scratched' && (
        <svg className="absolute inset-0 w-full h-full opacity-65" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Heavy Scratches */}
          <line x1="5" y1="12" x2="25" y2="22" stroke="#4a4a4a" strokeWidth="0.4" strokeLinecap="round" />
          <line x1="25" y1="22" x2="20" y2="35" stroke="#4a4a4a" strokeWidth="0.3" strokeLinecap="round" />
          <line x1="85" y1="10" x2="70" y2="35" stroke="#1c1c1c" strokeWidth="0.4" strokeLinecap="round" />
          <line x1="72" y1="33" x2="88" y2="45" stroke="#ffffff" strokeWidth="0.25" strokeLinecap="round" />
          <line x1="12" y1="75" x2="45" y2="92" stroke="#2a2a2a" strokeWidth="0.35" strokeLinecap="round" />
          <line x1="50" y1="5" x2="52" y2="18" stroke="#ffffff" strokeWidth="0.3" strokeLinecap="round" />
        </svg>
      )}

      {wearLevel === 'rusty' && (
        <>
          {/* Corner rusty spot gradients */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-radial from-amber-900/40 via-amber-800/10 to-transparent pointer-events-none blur-xs rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-radial from-yellow-950/45 via-amber-900/15 to-transparent pointer-events-none blur-sm rounded-tl-full" />
          <div className="absolute top-1/2 left-2 w-16 h-8 bg-amber-800/20 blur-md rounded-full rotate-45" />

          <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Fine web of cracks or corrosion */}
            <path d="M 0,20 Q 5,22 10,18 T 15,25" fill="none" stroke="#78350f" strokeWidth="0.4" />
            <path d="M 98,75 Q 92,72 90,82 T 82,85" fill="none" stroke="#78350f" strokeWidth="0.5" />
            <path d="M 12,85 Q 16,88 22,86" fill="none" stroke="#b45309" strokeWidth="0.3" />
            <line x1="85" y1="12" x2="72" y2="38" stroke="#78350f" strokeWidth="0.3" />
          </svg>
        </>
      )}
    </div>
  );
};
