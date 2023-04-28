import {type RepositoriesType, repositories} from '@typings/database.js';
import {typeormDataSource} from './datasource.js';

export const getRepository = (key: keyof RepositoriesType) => typeormDataSource.getRepository(
	repositories[key],
);
