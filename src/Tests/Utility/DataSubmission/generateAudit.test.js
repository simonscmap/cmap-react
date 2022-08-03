import generateAudits from '../../../Utility/DataSubmission/generateAudits';

var validations = generateAudits({
  Make: [],
  Sensor: [],
  Spatial_Resolution: [],
  Study_Domain: [],
  Temporal_Resolution: [],
});

// These functions are awkward to test like this and will break if their positions in
// the function array changes. Individual functions from generateAudits should be exported,
// and assembled in a separately exported function.
// Function return truthy values when validations fails
describe('Validations work as expected', () => {
  let number = validations.lat[0];
  let length = validations.var_short_name[2];
  let time = validations.time[1];
  let validLat = validations.lat[2];
  let validLon = validations.lon[2];
  let maxDepth = validations.depth[2];
  let codeFriendly = validations.var_short_name[1];
  let releaseDate = validations.dataset_release_date[1];

  test('Valid number validation works as expected', () => {
    expect(number(10)).toBeFalsy();
    expect(number('hello')).toBeTruthy();
  });

  test('Length validation works as expected', () => {
    expect(length('')).toBeTruthy();
    expect(length('a')).toBeFalsy();
    expect(
      length('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'),
    ).toBeTruthy();
  });

  test('Time validation works as expected', () => {
    expect(time('2016-05-03T13:55:12')).toBeFalsy();
    expect(time('2020-05-05')).toBeTruthy();
  });

  test('Lat validation works as expected', () => {
    expect(validLat(0)).toBeFalsy();
    expect(validLat(90)).toBeFalsy();
    expect(validLat(-90)).toBeFalsy();
    expect(validLat(-91)).toBeTruthy();
    expect(validLat(91)).toBeTruthy();
  });

  test('Lon validations work as expected', () => {
    expect(validLon(0)).toBeFalsy();
    expect(validLon(180)).toBeFalsy();
    expect(validLon(-180)).toBeFalsy();
    expect(validLon(-181)).toBeTruthy();
    expect(validLon(181)).toBeTruthy();
  });

  test('Max depth validation works as expected', () => {
    expect(maxDepth(11000)).toBeFalsy();
    expect(maxDepth(11001)).toBeTruthy();
  });

  test('Code-friendly validation works as expected', () => {
    expect(codeFriendly('pro15_Thing')).toBeFalsy();
    expect(codeFriendly(10)).toBeTruthy();
    expect(codeFriendly('10varr')).toBeTruthy();
    expect(codeFriendly('pro-abund')).toBeTruthy();
  });

  test('Release date validation works as expected', () => {
    expect(releaseDate('2016-05-03T18:43:12', 0)).toBeTruthy();
  });
});
