import {type RegisterCommandFn} from '@typings/command.js';
import ow from 'ow';
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

export const chunk = <T>(arr: T[], size: number): T[][] =>
	Array.from({length: Math.ceil(arr.length / size)}, (_, i: number) =>
		arr.slice(i * size, (i * size) + size),
	);

export const dechunk = <T>(data: T[][]): T[] => {
	const newData: T[] = Array.from<T>([]);
	data.forEach((item, index) => {
		if (Array.isArray(item)) {
			newData.push(...item);
		} else {
			newData.push(item);
		}

		Reflect.deleteProperty(data, index);
	});

	return newData;
};

export const registerCommand: RegisterCommandFn = (Instance, props) => {
	ow(props, ow.object.exactShape({
		name: ow.string.not.empty,
		description: ow.string.not.empty.minLength(10),
		aliases: ow.array.ofType(ow.string),
		args: ow.any(ow.array.ofType(
			ow.object.partialShape({
				name: ow.string.not.empty,
				type: ow.string.oneOf(['text', 'number']),
				required: ow.optional.boolean,
				isOption: ow.optional.boolean,
			}),
		), ow.object.partialShape({
			name: ow.string.not.empty,
			type: ow.string.oneOf(['text', 'number']),
			required: ow.optional.boolean,
			isOption: ow.optional.boolean,
		})),
		flags: ow.array.ofType(ow.string),
		category: ow.string,
		editable: ow.optional.boolean,
	}));
	const ins = new Instance(props);

	return client => {
		client.commands.set(props.name, ins);
	};
};
