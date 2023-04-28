import {type ButtonEntity} from '@database/Entities/Button.js';
import {type MessageEvent} from '@structures/Message.js';
import {Odesus, Util} from 'odesus';
import {Api} from 'telegram';
import {CallbackQueryEvent} from 'telegram/events/CallbackQuery.js';
import {type Repository} from 'typeorm';

// This code isn't ready
// We need to send the anime picture/image with the list of episodes (10 eps recent)

export const handlerInfoCallback = async (
	event: MessageEvent,
	record: ButtonEntity,
	repository: Repository<ButtonEntity>,
	url: string,
) => {
	if (!(event.$ev instanceof CallbackQueryEvent)) {
		return;
	}

	const odesu = new Odesus();

	const slug = Util.resolveSlug(url);
	if (!slug) {
		await event.$client.invoke(new Api.messages.SetBotCallbackAnswer({
			queryId: event.$ev.id,
			message: 'Kesalahan!',
			alert: true,
		}));
		return;
	}

	const anime = await odesu.getAnimeInfo(slug);
	if (!anime) {
		await event.$client.invoke(new Api.messages.SetBotCallbackAnswer({
			queryId: event.$ev.id,
			message: 'Maaf, saya ngga bisa nih dapatin data animenya :)',
			alert: true,
		}));
		return;
	}

	const photoBuffer = await odesu.client.request<ArrayBuffer>({
		url: anime.image,
		baseUrl: '',
		responseType: 'arraybuffer',
	});

	await event.$client.sendFile(event.$ev.chatId!, {
		caption: 'Here is the list of episodes:',
		file: Buffer.from(photoBuffer.data),
		fileSize: photoBuffer.data.byteLength,
		workers: 5,
	});

	await repository.createQueryBuilder()
		.delete()
		.where('messageId = :msgId', {msgId: record.messageId})
		.execute();

	await event.$client.editMessage(event.$ev.chatId!, {
		message: event.messageId,
		text: `**Judul:** ${anime.name}\n**Status:** ${anime.status}\n**Produser:** ${anime.genres.map(g => g.name).join(', ')}\n**Durasi:** ${anime.duration}\n\n${anime.synopsis}`,
	});
};
