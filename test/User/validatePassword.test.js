import validatePassword from '../../Components/User/validatePassword';

describe('validate password', () => {
  test('correctly validates passwords', () => {
    let passwords = {
      shouldPass: [
        'aaaaAA1!',
        '$rBp?@?NQ2lExWSBw}pHf3YHyRu&t49w',
        'aaaAAA111!!! ',
        'aA1 !"#$%&\'()*+,-./:;', // these two tests
        'aA1 <=>?@[\\]^_`{|}~', // cover all special chars
      ],
      shouldFail: [
        "too long 7VrWDM|l6='dBp{Qj~/*g8&]&Gu5JTnIX",
        '2 short',
        'nospecialchars111AAA', // space is considered special
        'no uppercase 111 !!!',
        'no numbers !!! AAA',
      ],
    };
    passwords.shouldPass.forEach((p) => {
      let result = validatePassword(p);
      if (!result) {
        console.log('expected to pass, but failed', p);
      }
      expect(result).toEqual(true);
    });

    passwords.shouldFail.forEach((p) => {
      let result = validatePassword(p);
      if (result) {
        console.log('expected to fail, but passed', p);
      }
      expect(validatePassword(p)).toEqual(false);
    });
  });
});
