import { createStore } from 'redux';
import rootReducer from '../../Redux/Reducers/index';

export default (initialState) => {
    return createStore(rootReducer, initialState);
}