import {coreConfig} from '@config/core.js';
import {type ButtonEntity} from '@database/Entities/Button.js';
import {buildButtons} from '@services/Internal/make-buttons.js';
import {$saveButtons} from '@services/Internal/save-buttons.js';
import {type MessageEvent} from '@structures/Message.js';
import {Odesus, Util} from 'odesus';
import {Api} from 'telegram';
import {returnBigInt} from 'telegram/Helpers.js';
import {CustomFile} from 'telegram/client/uploads.js';
import {CallbackQueryEvent} from 'telegram/events/CallbackQuery.js';
import {type Repository} from 'typeorm';

export const handlerInfoCallback = async (
	event: MessageEvent,
	record: ButtonEntity,
	repository: Repository<ButtonEntity>,
	url: string,
) => {
	if (!(event.$ev instanceof CallbackQueryEvent)) {
		return;
	}

	const odesu = new Odesus(coreConfig.otakudesuUrl);

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

	const episodes = anime.episodes.filter(episode => /\/episode/gi.test(episode.url))
		.reverse().slice(-5);

	const episodesText = episodes
		.map((episode, index) => `${index + 1}. ${episode.title}`)
		.join('\n');

	const prebuiltButtons = buildButtons(episodes.map((episode, index) => ({
		buttonValue: (index + 1).toString(),
		chatId: returnBigInt(record.chatId),
		data: Buffer.from(`episode;${episode.url}`),
		messageId: event.messageId,
		userId: returnBigInt(record.userId),
	})));

	await $saveButtons(prebuiltButtons.toPreProcess());
	await event.$client.sendFile(event.$ev.chatId!, {
		caption: `Here is the list of 5 recent episodes:\n\n${episodesText}`,
		file: new CustomFile('photo.png', photoBuffer.data.byteLength, '', Buffer.from(photoBuffer.data)),
		buttons: prebuiltButtons.toTelegram(),
	});

	await repository.createQueryBuilder()
		.delete()
		.where('messageId = :msgId', {msgId: record.messageId})
		.execute();

	await event.$client.editMessage(event.$ev.chatId!, {
		message: event.messageId,
		text: `**Judul:** ${anime.name}\n**Status:** ${anime.status}\n**Genre:** ${anime.genres.map(g => g.name).join(', ')}\n**Durasi:** ${anime.duration}\n**Produser:** ${anime.producers}\n\n${anime.synopsis}\n`,
	});
};
