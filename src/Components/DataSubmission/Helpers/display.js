// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript#18650828

export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const result = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${result}${sizes[i]}`;
}
