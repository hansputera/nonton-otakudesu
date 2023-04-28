import {DataSource} from 'typeorm';
import {FileEntity} from '@entities/File.js';
import {ButtonEntity} from '@entities/Button.js';

export const typeormDataSource = new DataSource({
	type: 'mariadb',
	url: process.env.MYSQL_URI,
	synchronize: true,
	entities: [FileEntity, ButtonEntity],
	cache: true,
});
