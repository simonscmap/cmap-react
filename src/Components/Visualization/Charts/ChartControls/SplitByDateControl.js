import { DateRange } from '@material-ui/icons';
import { makeGenericToggleControl } from './GenericToggleControl';

let tooltip = ['Un-Split by Date','Split by Date'];

export default makeGenericToggleControl(DateRange)(tooltip);
