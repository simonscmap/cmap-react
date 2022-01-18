import MoreIcon from '@material-ui/icons/More';
import { makeGenericToggleControl } from './GenericToggleControl';

let tooltip = ['Hide Visual Controls', 'Show Visual Controls'];

const makePersistModeBar = makeGenericToggleControl(MoreIcon)(tooltip);

export default makePersistModeBar;
