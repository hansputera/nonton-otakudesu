import {type TelegramFramework} from '@frameworks/GramJs.js';
import {type MessageOnCache} from '@typings/message.js';
import {type NewMessageEvent} from 'telegram/events/NewMessage.js';

export class MessageEvent {
	constructor(
		public readonly $ev: NewMessageEvent,
		public readonly $client: TelegramFramework,
	) {}

	get cached(): MessageOnCache | undefined {
		return this.$client.messages.get(this.$ev.message.id.toString());
	}
}
