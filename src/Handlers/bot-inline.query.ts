import {type TelegramFramework} from '@frameworks/GramJs.js';
import {Api} from 'telegram';

export const handlerBotInlineQuery = async (update: Api.UpdateBotInlineQuery, $client: TelegramFramework) => {
	const args = update.query.split(/\s+/g);

	if (args.length <= 1) {
		await $client.sendInline(update.queryId, [
			new Api.InputBotInlineResult({
				id: '404_not_found',
				type: 'article',
				title: '404 Not Found',
				description: 'Lu ngga bener kasih query',
				sendMessage: new Api.InputBotInlineMessageText({
					message: 'yh makasih, gada apa2',
				}),
			}),
		]);
		return;
	}

	await $client.sendInline(update.queryId, [
		new Api.InputBotInlineResult({
			id: '404_not_found',
			type: 'article',
			title: 'Maintenance',
			description: 'Wleeee',
			sendMessage: new Api.InputBotInlineMessageText({
				message: 'Maintenance dulu gaksih, makanya contribute lah ke reponya',
			}),
		}),
	]);
};
