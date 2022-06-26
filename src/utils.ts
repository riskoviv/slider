const defaultOptions: IPluginOptions = {
  stepSize: 10,
  minValue: -100,
  maxValue: 100,
  value1: -50,
  value2: 50,
  isVertical: false,
  isInterval: false,
  showTip: false,
  showScale: false,
  showProgressBar: false,
};

/**
 * uses Object.keys method but returns array of keys
 * of passed object in original type that keys of object has
 * @param obj object to get keys from
 * @returns array of object's keys but of original type
 */
const getTypedKeys = <T extends Record<string, unknown>>(obj: T):
(keyof T)[] => Object.keys(obj);

/**
 * uses Object.entries method but returns entries of passed object
 * with keys in original type
 * (not in string type as it does regular Object.entries method)
 * @param obj object to get entries from
 * @returns array of arrays each containing key & value of obj
 */
const getEntriesWithTypedKeys = <T extends Record<string, TypeOfValues<T>>>(obj: T):
[keyof T, TypeOfValues<T>][] => Object.entries(obj);

/**
 * used in cases when is needed to define size of fractional part of min, max, stepSize
 * to round values to precision of defined size
 * @param value the number (as string or number) whose fractional part size is gonna be defined
 * @returns number of digits in fractional part of the value
 */
const getFractionalPartSize = (value: number | string): number => {
  const valueAsString = typeof value === 'number' ? String(value) : value;
  if (!valueAsString.includes('.')) return 0;
  return valueAsString.split('.')[1].length;
};

export {
  defaultOptions,
  getTypedKeys,
  getEntriesWithTypedKeys,
  getFractionalPartSize,
};
