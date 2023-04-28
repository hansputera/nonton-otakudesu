import {type RepositoriesType} from '@typings/database.js';
import {typeormDataSource} from './datasource.js';
import {FileEntity} from '@entities/File.js';
import {ButtonEntity} from '@entities/Button.js';

export const getRepository = <T extends keyof RepositoriesType>(
	key: T,
): RepositoriesType[T] | undefined => {
	if (key === 'file') {
		return typeormDataSource.getRepository(FileEntity) as RepositoriesType[T];
	}

	if (key === 'button') {
		return typeormDataSource.getRepository(ButtonEntity) as RepositoriesType[T];
	}

	return undefined;
};
