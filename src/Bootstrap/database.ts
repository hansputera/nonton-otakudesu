import {typeormDataSource} from '@database/datasource.js';

async function bootDatabase() {
	await typeormDataSource.initialize();
}

void bootDatabase();
