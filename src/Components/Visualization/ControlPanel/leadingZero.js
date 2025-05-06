const leadingZero = (val) => {
  const v = '' + val;
  switch (v.length) {
    case 0:
      console.error('month value should not be empty');
      return '00';
    case 1:
      return '0' + v;
    default:
      return v;
  }
};

export default leadingZero;
