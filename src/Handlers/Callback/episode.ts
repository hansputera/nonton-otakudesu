import {coreConfig} from '@config/core.js';
import {getRepository} from '@database/repository.js';
import {type MessageEvent} from '@structures/Message.js';
import {Odesus, Util} from 'odesus';
import {FileId, FileType} from '@tgsnake/fileid';
import {Api} from 'telegram';
import {returnBigInt} from 'telegram/Helpers.js';
import {CustomFile} from 'telegram/client/uploads.js';
import {CallbackQueryEvent} from 'telegram/events/CallbackQuery.js';

// Fix: fix send previous video

export const handlerEpisodeCallback = async (
	event: MessageEvent,
	url: string,
) => {
	if (!(event.$ev instanceof CallbackQueryEvent)) {
		return;
	}

	const odesus = new Odesus(coreConfig.otakudesuUrl);
	const repository = getRepository('file');

	const slug = Util.resolveSlug(url);
	if (!slug) {
		await event.$client.invoke(new Api.messages.SetBotCallbackAnswer({
			queryId: event.$ev.id,
			message: 'Kesalahan!',
			alert: true,
		}));
		return;
	}

	const episode = await odesus.getEpisode(slug);
	if (!episode) {
		await event.$client.invoke(new Api.messages.SetBotCallbackAnswer({
			queryId: event.$ev.id,
			message: 'Episode tidak ditemukan',
			alert: true,
		}));
		return;
	}

	const photoBuffer = await odesus.client.request<ArrayBuffer>({
		url: episode.picture,
		baseUrl: '',
		responseType: 'arraybuffer',
	});

	const streamUrl = await episode.getStreamUrl();
	await event.$client.sendFile(event.$ev.chatId!, {
		caption: `<b>Judul:</b> <a href="${episode.url}">${episode.title}</a>\n\n<b>Available to download?:</b> ${streamUrl ? 'Yes' : 'Nope'}\n<b>Dipost oleh:</b> ${episode.postedBy}\n\n<b>Download links:</b>\n${episode.downloads.map((d, i) => `${i + 1}. ${d.resolution} (${d.size})\n${d.urls.map(u => `<a href="${u.url}">${u.source}</a>`).join(' | ')}`).join('\n')}`,
		parseMode: 'html',
		file: new CustomFile('photo.png', photoBuffer.data.byteLength, '', Buffer.from(photoBuffer.data)),
	});

	if (streamUrl?.length) {
		const previousMessage = await event.$client.sendMessage(event.$ev.chatId!, {
			message: 'Downloading current episode in recommended resolution...',
		});
		const fileCheck = await repository?.findOne({
			where: {
				name: episode.title,
			},
		});

		if (fileCheck) {
			const decoded = FileId.decodeFileId(fileCheck.fileId);

			// Await event.$client.invoke(new Api.messages.SendMedia({
			// 	media: new Api.InputMediaDocument({
			// 		id: new Api.InputDocument({
			// 			id: returnBigInt(decoded.id),
			// 			accessHash: returnBigInt(decoded.accessHash),
			// 			fileReference: decoded.fileReference!,
			// 		}),
			// 	}),
			// 	peer: event.$ev.chatId!,
			// 	message: 'Here is the video for ' + episode.title,
			// 	replyToMsgId: event.$ev.messageId,
			// }));

			await event.$client.sendMessage(event.$ev.chatId!, {
				file: new Api.InputMediaDocument({
					id: new Api.InputDocument({
						id: returnBigInt(decoded.id),
						accessHash: returnBigInt(decoded.accessHash),
						fileReference: decoded.fileReference!,
					}),
				}),
				thumb: Buffer.from(photoBuffer.data),
				attributes: [new Api.DocumentAttributeVideo({
					h: 320,
					w: 320,
					duration: 25 * 60_000,
					supportsStreaming: true,
				})],
			});
			return;
		}

		let buffer = Buffer.alloc(0);

		const stream = await episode.stream();
		stream.on('data', (chunk: Buffer) => {
			buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
		}).on('end', async () => {
			await previousMessage.edit({
				text: 'Video downloaded\nnow sending to telegram servers..',
			});

			const m = await event.$client.sendMessage(event.$ev.chatId!, {
				file: new CustomFile(episode.title.replace(/\s+/g, '_') + '.mp4', buffer.byteLength, '', buffer),
				thumb: Buffer.from(photoBuffer.data),
				attributes: [new Api.DocumentAttributeVideo({
					h: 320,
					w: 320,
					duration: 25 * 60_000,
					supportsStreaming: true,
				})],
			});

			const uploadedMediaDoc = (m.media as Api.MessageMediaDocument)
				.document as Api.Document;

			const encodedFile = FileId.encodeFileId({
				accessHash: BigInt(uploadedMediaDoc.accessHash.toJSNumber()),
				id: BigInt(uploadedMediaDoc.id.toJSNumber()),
				dcId: uploadedMediaDoc.dcId,
				subVersion: 32,
				version: 4,
				fileType: FileType.VIDEO,
				fileReference: uploadedMediaDoc.fileReference,
			});

			await repository?.insert({
				chatId: event.$ev.chatId?.toJSNumber(),
				fileId: encodedFile,
				name: episode.title,
			});
		});
	}
};
