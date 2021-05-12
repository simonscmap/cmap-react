import React from 'react';
import { shallow } from 'enzyme';
import SearchHelpContents from '../../../Components/Catalog/SearchHelpContents';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<SearchHelpContents store={mockReduxStore({})}/>);
});