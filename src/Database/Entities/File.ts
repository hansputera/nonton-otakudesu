/* eslint-disable new-cap */
import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity({
	name: 'files',
})
export class FileEntity {
	@PrimaryGeneratedColumn()
		id!: number;

	@Column({type: 'bigint'})
		fileId!: number;

	@Column({type: 'bigint'})
		chatId!: number;

	@Column()
		name!: string;

	@Column({type: 'number'})
		episode!: number;
}
