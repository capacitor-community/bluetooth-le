import { validateUUID } from './validators';

describe('Validate UUID', () => {
  const hr = '0000180d-0000-1000-8000-00805f9b34fb';
  const hrUpper = '0000180D-0000-1000-8000-00805F9B34FB';

  it('should return lowercase UUID', () => {
    const output = validateUUID(hr);
    expect(output).toBe(hr);
  });

  it('should transform uppercase to lowercase UUID', () => {
    const output = validateUUID(hrUpper);
    expect(output).toBe(hr);
  });

  it('should throw an error for a number', () => {
    expect(() => validateUUID(0x180d)).toThrowError('type number');
  });

  it('should throw an error for a uuid missing dash', () => {
    expect(() => validateUUID(hr.replace('-', ''))).toThrowError('format');
  });
});
