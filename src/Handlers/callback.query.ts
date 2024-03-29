import {getRepository} from '@database/repository.js';
import {type MessageEvent} from '@structures/Message.js';
import {CallbackQueryEvent} from 'telegram/events/CallbackQuery.js';

import {handlerInfoCallback} from './Callback/info.js';
import {handlerEpisodeCallback} from './Callback/episode.js';

export const handlerCallbackQuery = async (event: MessageEvent) => {
	if (event.$ev instanceof CallbackQueryEvent) {
		const sentKey = event.$ev.data?.toString('utf8');
		const repository = getRepository('button')!;

		const record = await repository.findOne({
			where: {
				key: sentKey,
			},
		});

		if (!record) {
			await event.$client.editMessage(event.$ev.chatId!, {
				message: event.messageId,
				text: 'This message is expired',
			});
			return;
		}

		if (record.expireAt <= new Date()) {
			const results = await repository.createQueryBuilder()
				.delete()
				.where('expireAt <= :tanggal', {
					tanggal: new Date(),
				}).execute();

			await event.$client.editMessage(event.$ev.chatId!, {
				message: event.messageId,
				text: `This message is expired.\n\n${results.affected ?? 0} rows deleted`,
			});
			return;
		}

		if (record.userId !== event.$ev.query.userId.toJSNumber()) {
			return;
		}

		const [state, url] = record.value.toString('utf8').split(';');
		switch (state) {
			case 'info':
				await handlerInfoCallback(event, record, repository, url);
				break;
			case 'episode':
				await handlerEpisodeCallback(event, url);
				break;
			default:
				await repository.remove(record);
				/** I don't need it anymore
				 	await event.$client.editMessage(event.$ev.chatId!, {
					message: event.messageId,
					text: 'This message contains invalid data',
				}); */
				await event.$ev.delete({revoke: true});
		}
	}
};
