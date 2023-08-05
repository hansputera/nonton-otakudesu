/* eslint-disable new-cap */
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from 'typeorm';

@Entity({
	name: 'files',
})
export class FileEntity {
	@PrimaryGeneratedColumn()
		id!: number;

	@Column({type: 'longtext'})
		fileId!: string;

	@Column({type: 'bigint', nullable: true})
		chatId!: number;

	@Column()
		name!: string;

	// @Column({type: 'longtext', transformer: [{
	// 	from: (value: string) => Buffer.from(value, 'base64'),
	// 	to: (value: Buffer) => value.toString('base64'),
	// }]})
	// 	fileRef!: Buffer;

	@CreateDateColumn()
		createdAt!: Date;
}
