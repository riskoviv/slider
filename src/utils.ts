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

export { getTypedKeys, getEntriesWithTypedKeys };
