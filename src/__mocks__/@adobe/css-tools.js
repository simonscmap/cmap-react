// Mock for @adobe/css-tools to avoid Jest parsing errors
module.exports = {
  parse: jest.fn(),
  stringify: jest.fn(),
};
