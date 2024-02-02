import parse from 'html-react-parser';

const renderText = (text) => {
  let result = '';
  const encodingContext = { em: 0, i: 0, u: 0, pre: false };
  for (let i = 0; i < text.length; i++) {
    // NOTE: because of javascript escape semantics, the string '\\' has length of 1,
    // and the '\\' is considered the equivalent of a '\' char
    const escaped = (i > 0) && (text.charAt(i-1) === '\\');

    switch (text.charAt(i)) {
      case '*':
        if (escaped) {
          result = result.slice(0, -1) + '*';
        } else if (encodingContext.pre === true) {
          result += '*';
        } else if (encodingContext.em === 0) {
          result += '<em>';
          encodingContext.em = 1;
        } else {
          result += '</em>';
          encodingContext.em = 0;
        }
        break;

      case '/':
        if (escaped) {
          result = result.slice(0, -1) + '/';
        } else if (encodingContext.pre === true) {
          result += '/';
        } else if (encodingContext.i === 0) {
          result += '<i>';
          encodingContext.i = 1;
        } else {
          result += '</i>';
          encodingContext.i = 0;
        }
        break;
      case '_':
        if (escaped) {
          result = result.slice(0, -1) + '_';
        } else if (encodingContext.pre === true) {
          result += '_';
        } else if (encodingContext.u === 0) {
          result += '<u>';
          encodingContext.u = 1;
        } else {
          result += '</u>';
          encodingContext.u = 0;
        }
        break;

      case '`':
        if (escaped) {
          result = result.slice(0, -1) + '`';
        } else if (encodingContext.pre === false) {
          encodingContext.pre = true; // switch on
        } else {
          encodingContext.pre = false; // switch off
        }
        break;

      default:
        result += text.charAt(i);
    }
  }

  let parsedText;
  try {
    parsedText = parse(result);
  } catch (e) {
    console.log('error parsing story headline', e);
    // fallback to string representation of headline
    parsedText = text;
  }
  return parsedText;
};

export default renderText;
