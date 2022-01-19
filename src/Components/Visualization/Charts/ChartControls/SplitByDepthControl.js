import { DateRange } from '@material-ui/icons';
import { makeGenericToggleControl } from './GenericToggleControl';

let tooltip = ['Un-Split by Depth','Split by Depth'];

export default makeGenericToggleControl(DateRange)(tooltip);
