import {ButtonEntity} from '@entities/Button.js';
import {FileEntity} from '@entities/File.js';

export const repositories = {
	file: FileEntity,
	button: ButtonEntity,
};

export type RepositoriesType = typeof repositories;
