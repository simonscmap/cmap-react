import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

// const window = global;

global.URL = {};
global.URL.createObjectURL = jest.fn();

HTMLCanvasElement.prototype.getContext = () => {
  return '';
};
