import React from 'react';
import { shallow } from 'enzyme';
import SelectOptionRequestForm from '../../../Components/Datasubmission/SelectOptionRequestForm';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<SelectOptionRequestForm store={mockReduxStore({})}/>);
});