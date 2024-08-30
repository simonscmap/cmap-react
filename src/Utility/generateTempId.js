const generateTemporaryId = (prefix = "_") => {
  return `${prefix}:${(Math.random () * 1000000).toString().slice(0,6)}`;
};

export default generateTemporaryId;
