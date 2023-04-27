import {type TelegramFramework} from '@frameworks/GramJs.js';
import {type MessageOnCache} from '@typings/message.js';
import {type NewMessageEvent} from 'telegram/events/NewMessage.js';

import {Api} from 'telegram/tl/api.js';
import {type Command} from './Command.js';

export class MessageEvent {
	constructor(
		public readonly $ev: NewMessageEvent,
		public readonly $client: TelegramFramework,
	) {}

	public getCommandName(): string | undefined {
		const command = this.entities?.find(entity => entity instanceof Api.MessageEntityBotCommand);
		if (!command) {
			return undefined;
		}

		return this.text.substring(command.offset, command.length)
			.slice(1);
	}

	public async reply(text: string): Promise<void> {
		const oldRepliedMessage = this.cached;

		if (oldRepliedMessage) {
			await this.$client.editMessage(oldRepliedMessage.chat, {
				message: parseInt(oldRepliedMessage.lastResponseMessageId, 10),
				text,
			});
		} else {
			const message = await this.$client.sendMessage(this.$ev.chat!, {
				message: text,
				replyTo: this.$ev.message.id,
			});

			this.$client.messages.set(this.$ev.message.id.toString(), {
				chat: message.chat!,
				lastResponseMessageId: message.id.toString(),
			});
		}
	}

	get text(): string {
		return this.$ev.message.message;
	}

	get cached(): MessageOnCache | undefined {
		return this.$client.messages.get(this.$ev.message.id.toString());
	}

	get command(): Command | undefined {
		const cmdName = this.getCommandName()?.toLowerCase();
		if (!cmdName) {
			return undefined;
		}

		return [...this.$client.commands.entriesAscending()]
			.find(([name, cmd]) => cmdName === name || cmd.props.aliases.includes(cmdName))?.[1];
	}

	get entities() {
		return this.$ev.message.entities;
	}
}
