import React from 'react';

export const useIsOverflow = (ref, callback) => {
  const [isOverflow, setIsOverflow] = React.useState(undefined);

  React.useLayoutEffect(() => {
    const { current } = ref;

    const trigger = () => {
      console.log ('trigger', current.scrollWidth);
      const hasOverflow = current.scrollWidth > current.clientWidth;

      setIsOverflow(hasOverflow);

      if (callback) {
        callback(hasOverflow);
      }
    };

    if (current) {
      trigger();
    }
  }, [callback, ref]);

  return isOverflow;
};
