import {randomUUID} from 'node:crypto';
import {type PreProcessButton, type CreatePreProcessButton, type PrebuiltPreProcessButton} from '@typings/internal.js';
import {Api} from 'telegram';
import {chunk} from '@utilities/object.js';

export const buildButtons = (inputs: CreatePreProcessButton[], chunkSize = 5): PrebuiltPreProcessButton => {
	const rows: PreProcessButton[] = inputs.map(input => {
		const key = randomUUID().split('-')[0];

		return {
			key,
			props: {
				chatId: input.chatId,
				userId: input.userId,
				messageId: input.messageId,
			},
			value: input.data,
			button: new Api.KeyboardButtonCallback({
				text: input.buttonValue,
				data: Buffer.from(key, 'utf8'),
			}),
		};
	});

	return {
		toPreProcess() {
			return chunk(rows, chunkSize);
		},
		toTelegram() {
			return chunk(rows.map(row => row.button), chunkSize);
		},
	};
};
