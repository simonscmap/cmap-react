function isScaleEvent(toolEventInfo) {
  return toolEventInfo && toolEventInfo.type
    && toolEventInfo.type.indexOf('scale') === 0;
}

function isStopEvent(toolEventInfo) {
  return toolEventInfo && toolEventInfo.type
    && (toolEventInfo.type === 'move-stop' || toolEventInfo.type === 'scale-stop');
}

function getConstraintOptions(isCreateMode, toolEventInfo) {
  if (isCreateMode) {
    return { clampLat: true };
  }
  return { clampLat: !!isScaleEvent(toolEventInfo) };
}

export {
  isScaleEvent,
  isStopEvent,
  getConstraintOptions,
};
