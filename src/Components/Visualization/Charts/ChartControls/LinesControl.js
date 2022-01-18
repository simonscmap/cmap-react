import { ShowChart } from '@material-ui/icons';
import { makeGenericToggleControl } from './GenericToggleControl';

let tooltip = ['Hide Plot Lines','Show Plot Lines'];

const makeLinesControl = makeGenericToggleControl(ShowChart)(tooltip);
export default makeLinesControl;
