import { createStore, applyMiddleware } from "redux";
import rootReducer from "./Reducers";
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistenceMiddleware } from '../Services/persist';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(sagaMiddleware, persistenceMiddleware)
  )
)

sagaMiddleware.run(rootSaga);

export default store;
