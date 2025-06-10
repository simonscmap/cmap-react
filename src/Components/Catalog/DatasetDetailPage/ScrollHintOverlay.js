import React, { useEffect, useRef, useState } from 'react';

export default function ScrollHintOverlay({ children }) {
  const containerRef = useRef(null);
  const [showHint, setShowHint] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateHintVisibility = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const scrollable = container.scrollHeight > container.clientHeight;
      const nativeScrollbarVisible =
        container.offsetWidth > container.clientWidth;

      setShowHint(scrollable && !nativeScrollbarVisible && !hasScrolled);
    };

    updateHintVisibility();
    window.addEventListener('resize', updateHintVisibility);
    return () => window.removeEventListener('resize', updateHintVisibility);
  }, [hasScrolled]);

  const handleScroll = () => {
    if (!hasScrolled) {
      setHasScrolled(true);
      setShowHint(false);
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
            width: '6px',
            height: '40px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '3px',
            animation: 'fadeOut 3s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
