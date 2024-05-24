import {ObjectUtils} from './object-utils';

describe('ObjectUtils', () => {
  it('should remove keys with null values', () => {
    const result = ObjectUtils.removeNull({
      field1: false,
      field2: null,
      field3: 12345,
      field4: 'null',
      field5: {
        embedded: 'test',
        nullKey: null
      }
    });

    expect(result).toEqual({
      field1: false,
      field3: 12345,
      field4: 'null',
      field5: {
        embedded: 'test'
      }
    });
  });

  it('should return value when it is null', () => {
    expect(ObjectUtils.removeNull(null)).toBeNull();
  });

  it('should return value when it is undefined', () => {
    expect(ObjectUtils.removeNull(undefined)).toBeUndefined();
  });
});
