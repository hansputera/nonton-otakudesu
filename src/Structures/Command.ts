import {type CommandProps} from '@typings/command.js';
import {type MessageEvent} from './Message.js';
import {type TelegramFramework} from '@frameworks/GramJs.js';

export class Command {
	protected client!: TelegramFramework;

	/**
     * @param props Command properties
     */
	constructor(public readonly props: CommandProps) {}

	async handle(event: MessageEvent): Promise<void> {
		await this.client.sendMessage(event.$ev.chatId!, {
			message: 'Hello World!',
		});
	}

	async _init(event: MessageEvent): Promise<void> {
		this.client = event.$client;
		return this.handle(event);
	}
}
