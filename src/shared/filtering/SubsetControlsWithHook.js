import React from 'react';
import SubsetControls from './SubsetControls';
import useSubsetControls from './useSubsetControls';

/**
 * Enhanced SubsetControls component that uses the useSubsetControls hook
 * This provides a higher-level component that manages its own state
 */
const SubsetControlsWithHook = ({
  dataset,
  onSubsetChange,
  initialOptions = { subset: false },
  includeOptionsState = true,
  classes,
  ...otherProps
}) => {
  const {
    subsetParams,
    subsetSetters,
    maxDays,
    isInvalid,
    optionsState,
    handleSwitch,
    setInvalidFlag,
    subsetIsDefined,
  } = useSubsetControls(dataset, {
    includeOptionsState,
    initialOptions,
  });

  // Call parent callback when subset changes
  React.useEffect(() => {
    if (onSubsetChange) {
      onSubsetChange({
        subsetParams,
        subsetIsDefined,
        isInvalid,
        ...(includeOptionsState && { optionsState }),
      });
    }
  }, [
    subsetParams,
    subsetIsDefined,
    isInvalid,
    optionsState,
    onSubsetChange,
    includeOptionsState,
  ]);

  return (
    <SubsetControls
      subsetParams={subsetParams}
      subsetSetters={subsetSetters}
      dataset={dataset}
      handleSwitch={handleSwitch}
      optionsState={optionsState}
      setInvalidFlag={setInvalidFlag}
      maxDays={maxDays}
      classes={classes}
      {...otherProps}
    />
  );
};

export default SubsetControlsWithHook;
