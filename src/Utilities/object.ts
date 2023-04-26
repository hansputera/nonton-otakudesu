import {camelToSnakeCase} from './words.js';

export const camelToSnakeCaseKey = <T extends Record<string, unknown>>(object: T): T => {
	for (const key of Object.keys(object)) {
		const keyMaked = camelToSnakeCase(key);

		Reflect.set(object, keyMaked.toUpperCase(), object[key]);
		Reflect.deleteProperty(object, key);
	}

	return object;
};

export const createObject = <T extends Record<string, unknown>>(object?: T): T => Object.create(object ?? null) as T;

export const getVarsFromObject = <T extends Record<string, unknown>>(
	object: T,
	keys: string[],
): T => {
	const result = createObject<T>();

	for (const key of keys) {
		const value = Reflect.get(object, key);
		if (value) {
			Reflect.set(result, key, value);
		}
	}

	return result;
};
