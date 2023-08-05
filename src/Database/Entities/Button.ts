/* eslint-disable new-cap */
import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity({
	name: 'buttons',
})
export class ButtonEntity {
	@PrimaryGeneratedColumn()
		id!: number;

	@Column({type: 'bigint', transformer: [{
		to: (value: number) => value,
		from: (value: string) => parseInt(value, 10),
	}]})
		userId!: number;

	@Column({type: 'bigint', transformer: [{
		to: (value: number) => value,
		from: (value: string) => parseInt(value, 10),
	}]})
		chatId!: number;

	@Column()
		key!: string;

	@Column({nullable: true, type: 'bigint', transformer: [{
		to: (value: number) => value,
		from: (value: string) => parseInt(value || '0', 10),
	}]})
		messageId?: number;

	@Column({type: 'blob'})
		value!: Buffer;

	@Column({type: 'datetime'})
		expireAt!: Date;
}
