import React, { useEffect, useRef, useState } from 'react';

export default function ScrollHintOverlay({ children }) {
  const containerRef = useRef(null);
  const [showHint, setShowHint] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollbarHeight, setScrollbarHeight] = useState(0);
  const [animateFadeOut, setAnimateFadeOut] = useState(false);

  useEffect(() => {
    const updateHintVisibility = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const scrollable = container.scrollHeight > container.clientHeight;
      const nativeScrollbarVisible =
        container.offsetWidth > container.clientWidth;

      const ratio = container.clientHeight / container.scrollHeight;
      const height = Math.max(
        Math.min(container.clientHeight * ratio, container.clientHeight * 0.2),
        20,
      );
      setScrollbarHeight(height);

      setShowHint(scrollable && !nativeScrollbarVisible && !hasScrolled);
    };

    updateHintVisibility();
    window.addEventListener('resize', updateHintVisibility);
    return () => window.removeEventListener('resize', updateHintVisibility);
  }, [hasScrolled]);

  const handleScroll = () => {
    if (!hasScrolled) {
      setHasScrolled(true);
      setAnimateFadeOut(true);
      setTimeout(() => {
        setShowHint(false);
      }, 750); // Match the duration of the fadeOut animation
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ position: 'relative', overflowY: 'auto', maxHeight: '100%' }}
    >
      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      {children}
      {showHint && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 2,
            width: '7px',
            height: `${scrollbarHeight}px`,
            backgroundColor: '#5F9B2B',
            borderRadius: '3px',
            animation: animateFadeOut
              ? 'fadeOut 0.75s ease-out forwards'
              : 'none',
            pointerEvents: 'none',
          }}
        ></div>
      )}
    </div>
  );
}
