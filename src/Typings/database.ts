import {type ButtonEntity} from '@entities/Button.js';
import {type FileEntity} from '@entities/File.js';
import {type Repository} from 'typeorm';

export type RepositoriesType = {
	file: Repository<FileEntity>;
	button: Repository<ButtonEntity>;
};
