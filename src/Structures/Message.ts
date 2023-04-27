import {type TelegramFramework} from '@frameworks/GramJs.js';
import {type MessageOnCache} from '@typings/message.js';
import {type NewMessageEvent} from 'telegram/events/NewMessage.js';

import {Api} from 'telegram/tl/api.js';

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

		return this.text.substring(command.offset, command.length);
	}

	get text(): string {
		return this.$ev.message.message;
	}

	get cached(): MessageOnCache | undefined {
		return this.$client.messages.get(this.$ev.message.id.toString());
	}

	get entities() {
		return this.$ev.message.entities;
	}
}
