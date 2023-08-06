import {coreConfig} from '@config/core.js';
import {getRepository} from '@database/repository.js';
import {type MessageEvent} from '@structures/Message.js';
import {Odesus, Util} from 'odesus';
import {FileId, FileType} from '@tgsnake/fileid';
import {Api} from 'telegram';
import stripIndent from 'strip-indent';
import {returnBigInt} from 'telegram/Helpers.js';
import {CustomFile} from 'telegram/client/uploads.js';
import {CallbackQueryEvent} from 'telegram/events/CallbackQuery.js';

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
	const mirror = episode.mirrors[
		Math.floor(Math.random() * episode.mirrors.length)
	];

	const streamUrl = await mirror.getStreamUrl().catch(e => ({e: (e as Error).message}));
	const isAvailable2Download = typeof streamUrl !== 'object';

	await event.$client.sendFile(event.$ev.chatId!, {
		caption: stripIndent(`
			<b>Judul:</b> <a href="${episode.url}">${episode.title}</a>\n
			<b>Available to download?:</b> ${isAvailable2Download ? 'Yes' : 'Nope'}\n
			<b>Dipost oleh:</b> ${episode.postedBy}\n
			<b>Download links:</b>\n
			${episode.downloads.map((d, i) => `${i + 1}. ${d.resolution} (${d.size})\n${d.urls.map(u => `<a href="${u.url}">${u.source}</a>`).join(' | ')}`).join('\n')}`,
		),
		parseMode: 'html',
		file: new CustomFile('photo.png', photoBuffer.data.byteLength, '', Buffer.from(photoBuffer.data)),
	});
	const previousMessage = await event.$client.sendMessage(event.$ev.chatId!, {
		message: isAvailable2Download
			? 'Downloading current episode in recommended resolution...'
			: `Cannot download this episode because \`${streamUrl.e}\`\nDirect link: ${
				await mirror.getMirrorUrl()
			}`,
	});

	if (isAvailable2Download) {
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

			await previousMessage.delete({revoke: true});
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
				message: stripIndent(`
				${episode.title} video delivered, time: ${
	fileCheck.createdAt.toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	})}`),
				replyTo: previousMessage,
			});
			return;
		}

		const stream = await mirror.stream().catch(e => (e as Error).message);
		if (typeof stream === 'string') {
			await previousMessage.edit({
				text: stripIndent(
					`Error: **${stream}**
					Direct access: ${await mirror.getMirrorUrl()}`,
				),
			});
			return;
		}

		let buffer = Buffer.alloc(0);
		stream.on('data', (chunk: Buffer) => {
			buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
		}).on('end', async () => {
			await previousMessage.edit({
				text: stripIndent(`
					Video downloaded (${mirror.resolution} - ${mirror.source})
					now sending to telegram servers..`,
				),
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
				message: `${episode.title} video delivered, time: ${(new Date()).toLocaleDateString('en-US', {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
				})}`,
				replyTo: previousMessage,
			});

			const uploadedMediaDoc = (m.media as Api.MessageMediaDocument)
				.document as Api.Document;

			const encodedFile = FileId.encodeFileId({
				accessHash: BigInt(uploadedMediaDoc.accessHash.toString()),
				id: BigInt(uploadedMediaDoc.id.toString()),
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
