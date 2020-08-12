import React from 'react';
import { shallow } from 'enzyme';
import DownloadConfirmationDialog from '../../../Components/Visualization/DownloadConfirmationDialog';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<DownloadConfirmationDialog store={mockReduxStore({})}/>);
});