const utils = {
  /**
   * use Object.entries method but return entries of passed object
   * with keys in original type
   * (not in string type as it does regular Object.entries method)
   * @param obj object to get entries from
   * @returns array of arrays each containing key & value of obj
   */
  getEntriesWithTypedKeys<T extends Record<string, TypeOfValues<T>>>(obj: T):
  [keyof T, TypeOfValues<T>][] {
    return Object.entries(obj);
  },
};

export default utils;
