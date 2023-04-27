import ow from 'ow';
import {camelToSnakeCaseKey} from './object.js';

export const assertEnv = (env: NodeJS.ProcessEnv): void => {
	ow(env, ow.object.partialShape(camelToSnakeCaseKey({
		apiId: ow.string.numeric,
		apiHash: ow.string.not.numeric,
		botToken: ow.string.not.empty,
		mysqlUri: ow.string,
	})));
};
