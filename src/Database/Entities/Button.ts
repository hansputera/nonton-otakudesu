/* eslint-disable new-cap */
import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity({
	name: 'buttons',
})
export class ButtonEntity {
	@PrimaryGeneratedColumn()
		id!: number;

	@Column({type: 'bigint'})
		userId!: number;

	@Column({type: 'bigint'})
		chatId!: number;

	@Column()
		key!: string;

	@Column({nullable: true, type: 'bigint'})
		messageId?: number;

	@Column({type: 'blob'})
		value!: Buffer;

	@Column({type: 'datetime'})
		expireAt!: Date;
}
