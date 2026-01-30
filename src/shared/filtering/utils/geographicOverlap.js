import { longitudeRangesOverlap } from '../../utility/longitudeRange';

export function presetOverlapsDataset(preset, dataset) {
  if (!preset || !dataset) return false;
  if (
    dataset.Lat_Min === undefined ||
    dataset.Lat_Max === undefined ||
    dataset.Lon_Min === undefined ||
    dataset.Lon_Max === undefined
  ) {
    return false;
  }

  const noLatOverlap =
    preset.northLatitude < dataset.Lat_Min ||
    preset.southLatitude > dataset.Lat_Max;

  const lonOverlaps = longitudeRangesOverlap(
    preset.westLongitude,
    preset.eastLongitude,
    dataset.Lon_Min,
    dataset.Lon_Max,
  );

  return !noLatOverlap && lonOverlaps;
}

export function presetOverlapsAnyDataset(preset, datasets) {
  if (!datasets || datasets.length === 0) return true;
  return datasets.some((dataset) => presetOverlapsDataset(preset, dataset));
}

export function computePresetDisabledStates(presets, datasets) {
  const disabledMap = new Map();

  presets.forEach((preset) => {
    const hasOverlap = presetOverlapsAnyDataset(preset, datasets);
    disabledMap.set(preset.label, !hasOverlap);
  });

  return disabledMap;
}
