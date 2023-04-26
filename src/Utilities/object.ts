import {camelToSnakeCase} from './words.js';

export const camelToSnakeCaseKey = <T extends Record<string, unknown>>(object: T): T => {
	for (const key of Object.keys(object)) {
		const keyMaked = camelToSnakeCase(key);

		Reflect.set(object, keyMaked.toUpperCase(), object[key]);
		Reflect.deleteProperty(object, key);
	}

	return object;
};
