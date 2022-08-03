// Useful discussion: https://security.stackexchange.com/questions/2096/what-chars-should-i-not-allow-in-passwords

// See also: https://owasp.org/www-community/password-special-characters
const numbers = '0123456789';
const special = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const validatePassword = (candidate) => {
  if (typeof candidate !== 'string') {
    return false;
  }

  let length = candidate.length;

  if (length < 8 || length > 32) {
    return false;
  }

  let numberCount = 0;
  let specialCount = 0;
  let upperCaseCount = 0;

  let outOfRange = [];

  for (let ix = 0; ix < candidate.length; ix++) {
    let c = candidate.charAt(ix);
    let charCode = candidate.charCodeAt(ix);

    if (charCode < 32 || charCode > 128) {
      outOfRange.push(c);
    }

    if (special.includes(c)) {
      specialCount++;
    } else if (numbers.includes(c)) {
      numberCount++;
    } else if (uppers.includes(c)) {
      upperCaseCount++;
    }
  }

  let result =
    numberCount > 0 &&
    specialCount > 0 &&
    upperCaseCount > 0 &&
    outOfRange.length === 0;

  return result;
};

export default validatePassword;
