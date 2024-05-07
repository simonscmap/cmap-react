import Bowser from 'bowser';

const parseError = (e) => {
  console.log ('parseError', e);
  let info = Bowser.parse(window.navigator.userAgent);
  let browserInfo = `${info.browser.name || 'Unknown browser'} ${
      info.browser.version || 'Unknown version'
    }`;
  let osInfo = `${info.os.name || 'Unknown OS'} ${
      info.os.versionName || 'Unknown version'
    }`;

  let errorMessage = e && e.toString && e.toString();
  let stackArr = e && e.stack && e.stack.split && e.stack.split('\n');
  let stackFirstLine = stackArr && stackArr.length > 0 ? stackArr[0] : null;
  let location = window.location.href;

  return {
    errorMessage,
    browserInfo,
    osInfo,
    stackFirstLine,
    location
  };
};

export default parseError;
