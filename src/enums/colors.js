import { colors as homeColors } from '../Components/Home/theme';

// TODO Gradually consolidate scattered color/font/design definitions to reference the home theme

const errorYellow = '#ffe336';

const colors = {
  // Primitive colors
  primary: '#9dd162', //rgb(157, 209, 98)
  // primary: homeColors.green.lime,
  solidPaper: '#184562',
  backgroundGray: '#424242',
  secondary: '#22A3B9',
  errorYellow,
  greenHover: 'rgba(97, 149, 38, .4)',
  blueHover: 'rgb(105, 255, 242, 0.4)',
  teal: homeColors.blue.teal,
  slate: homeColors.blue.slate,
  deeps: '#03172F',
  blockingError: errorYellow,
  nonBlockingInfo: homeColors.blue.teal ,
};

export default Object.freeze(colors);
