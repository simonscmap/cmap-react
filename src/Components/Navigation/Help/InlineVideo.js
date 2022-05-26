import React from 'react';

const Video = ({ src }) => {
  return (
    <iframe
      width="592"
      height="333"
      src={src}
      frameBorder="0"
      allow="autoplay; encrypted-media"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
      allowFullScreen={true}
    />
  );
};

export default Video;
