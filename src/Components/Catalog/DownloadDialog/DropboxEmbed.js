import React, { useEffect, useRef } from 'react';

const DropboxEmbed = ({ sharedLink }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      window.Dropbox.embed({ link: sharedLink }, containerRef.current);
    }
  }, [sharedLink]);

  return <div ref={containerRef} />;
};

export default DropboxEmbed;
