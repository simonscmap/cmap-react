import {
  fieldLabels,
  getFieldLabel,
  messages,
  isIntermediateSigned,
  isIntermediateUnsigned,
} from '../validationMessages';

describe('fieldLabels', () => {
  it('maps field keys to display labels', () => {
    expect(fieldLabels.latStart).toBe('S Latitude');
    expect(fieldLabels.latEnd).toBe('N Latitude');
    expect(fieldLabels.lonStart).toBe('W Longitude');
    expect(fieldLabels.lonEnd).toBe('E Longitude');
    expect(fieldLabels.depthStart).toBe('Min Depth');
    expect(fieldLabels.depthEnd).toBe('Max Depth');
    expect(fieldLabels.dateStart).toBe('Start Date');
    expect(fieldLabels.dateEnd).toBe('End Date');
  });
});

describe('getFieldLabel', () => {
  it('constructs label from fieldType and position', () => {
    expect(getFieldLabel('lat', true)).toBe('S Latitude');
    expect(getFieldLabel('lat', false)).toBe('N Latitude');
    expect(getFieldLabel('lon', true)).toBe('W Longitude');
    expect(getFieldLabel('depth', false)).toBe('Max Depth');
  });

  it('returns Value for unknown field types', () => {
    expect(getFieldLabel('unknown', true)).toBe('Value');
    expect(getFieldLabel('temperature', false)).toBe('Value');
  });
});

describe('isIntermediateSigned', () => {
  it('detects incomplete signed number inputs', () => {
    expect(isIntermediateSigned('')).toBe(true);
    expect(isIntermediateSigned('-')).toBe(true);
    expect(isIntermediateSigned('.')).toBe(true);
    expect(isIntermediateSigned('-.')).toBe(true);
    expect(isIntermediateSigned('-0')).toBe(true);
    expect(isIntermediateSigned('0.')).toBe(true);
  });

  it('returns false for complete numbers', () => {
    expect(isIntermediateSigned('1')).toBe(false);
    expect(isIntermediateSigned('-1')).toBe(false);
    expect(isIntermediateSigned('0.5')).toBe(false);
    expect(isIntermediateSigned('123')).toBe(false);
  });

  it('handles values with whitespace', () => {
    expect(isIntermediateSigned(' ')).toBe(true);
    expect(isIntermediateSigned(' - ')).toBe(true);
    expect(isIntermediateSigned(' . ')).toBe(true);
  });

  it('handles numeric input (coerced to string)', () => {
    expect(isIntermediateSigned(0)).toBe(false);
    expect(isIntermediateSigned(1)).toBe(false);
  });
});

describe('isIntermediateUnsigned', () => {
  it('detects incomplete unsigned number inputs', () => {
    expect(isIntermediateUnsigned('')).toBe(true);
    expect(isIntermediateUnsigned('.')).toBe(true);
    expect(isIntermediateUnsigned('0.')).toBe(true);
  });

  it('does not detect minus-prefixed inputs', () => {
    expect(isIntermediateUnsigned('-')).toBe(false);
    expect(isIntermediateUnsigned('-.')).toBe(false);
    expect(isIntermediateUnsigned('-0')).toBe(false);
  });

  it('returns false for complete numbers', () => {
    expect(isIntermediateUnsigned('1')).toBe(false);
    expect(isIntermediateUnsigned('0.5')).toBe(false);
  });
});

describe('messages', () => {
  it('generates required message', () => {
    expect(messages.required('S Latitude')).toBe('S Latitude is required');
  });

  it('generates invalidNumber message', () => {
    expect(messages.invalidNumber('S Latitude')).toBe(
      'S Latitude: Enter a valid number',
    );
  });

  it('generates invalidDate message', () => {
    expect(messages.invalidDate('Start Date')).toBe(
      'Start Date: Enter a valid date',
    );
  });

  it('generates invalidYear message', () => {
    expect(messages.invalidYear('Start Date')).toBe(
      'Start Date: Year must be 4 digits',
    );
  });

  it('generates belowMin with special zero case', () => {
    expect(messages.belowMin('Min Depth', 0)).toBe(
      'Min Depth cannot be negative',
    );
    expect(messages.belowMin('S Latitude', -90)).toBe(
      'S Latitude must be -90 or greater',
    );
  });

  it('generates aboveMax message', () => {
    expect(messages.aboveMax('N Latitude', 90)).toBe(
      'N Latitude must be 90 or less',
    );
  });

  it('generates rangeInverted message', () => {
    expect(messages.rangeInverted('S Latitude', 'N Latitude')).toBe(
      'S Latitude must be less than N Latitude',
    );
  });

  it('generates dateBelowMin message', () => {
    expect(messages.dateBelowMin('Start Date', '2020-01-01')).toBe(
      'Start Date must be 2020-01-01 or later',
    );
  });

  it('generates dateAboveMax message', () => {
    expect(messages.dateAboveMax('End Date', '2020-12-31')).toBe(
      'End Date must be 2020-12-31 or earlier',
    );
  });

  it('generates dateRangeInverted message', () => {
    expect(messages.dateRangeInverted()).toBe(
      'Start Date must be before End Date',
    );
  });
});
