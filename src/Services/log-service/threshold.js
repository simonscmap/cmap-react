import { localStorageApi } from '../persist/local';
import { isProduction } from '../env';

const localThreshold = localStorageApi.get('logThreshold');

let threshold;

if (localThreshold) {
 threshold = localThreshold;
} else {
  threshold = isProduction ? 2 : 4
}

export default threshold;
