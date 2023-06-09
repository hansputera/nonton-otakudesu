import {type TelegramFramework} from '@frameworks/GramJs.js';
import {type MessageOnCache} from '@typings/message.js';
import {NewMessageEvent} from 'telegram/events/NewMessage.js';
import {DeletedMessageEvent} from 'telegram/events/DeletedMessage.js';
import {CallbackQueryEvent} from 'telegram/events/CallbackQuery.js';

import {Api} from 'telegram/tl/api.js';
import {type Command} from './Command.js';
import {type EditMessageParams, type SendMessageParams} from 'telegram/client/messages.js';

export class MessageEvent {
	constructor(
		public readonly $ev: NewMessageEvent | DeletedMessageEvent | CallbackQueryEvent,
		public readonly $client: TelegramFramework,
	) {}

	public getCommandName(): string | undefined {
		const command = this.entities?.find(entity => entity instanceof Api.MessageEntityBotCommand);
		if (!command) {
			return undefined;
		}

		return this.text.substring(command.offset, command.length)
			.slice(1).replace(/@.+/g, '');
	}

	public getArgOption(key: string): string | undefined {
		const flag = this.flags.find(f => f.startsWith('--' + key));

		return flag?.replace(/--[a-zA-Z0-9_]+(:|=)/g, '');
	}

	public async reply(text: string, params?: SendMessageParams | EditMessageParams): Promise<void> {
		if (this.$ev instanceof DeletedMessageEvent) {
			return;
		}

		const oldRepliedMessage = this.cached;

		if (oldRepliedMessage) {
			if (this.command && !this.command.props.editable) {
				return;
			}

			await this.$client.editMessage(oldRepliedMessage.chat, {
				...params as EditMessageParams,
				message: parseInt(oldRepliedMessage.lastResponseMessageId, 10),
				text,
			});
		} else {
			const message = await this.$client.sendMessage(this.$ev.chatId!, {
				...params as SendMessageParams,
				message: text,
				replyTo: this.messageId,
			});

			if (this.command && !this.command.props.editable) {
				return;
			}

			const peer = await this.$client.getInputEntity(this.$ev.chatId!);
			this.$ev._chatPeer = peer;
			this.$client.messages.set(this.messageId.toString(), {
				chat: peer,
				lastResponseMessageId: message.id.toString(),
			});
		}
	}

	get userId(): bigInt.BigInteger | undefined {
		if (this.$ev instanceof NewMessageEvent) {
			return this.$ev.message.sender?.id;
		}

		if (this.$ev instanceof CallbackQueryEvent) {
			return this.$ev.sender?.id;
		}

		return undefined;
	}

	get text(): string {
		if (!(this.$ev instanceof NewMessageEvent)) {
			return '';
		}

		return this.$ev.message.message;
	}

	get args(): string[] {
		return this._args.filter(x => !x.startsWith('--'));
	}

	get flags(): string[] {
		return this._args.filter(x => x.startsWith('--'));
	}

	get messageId(): number {
		if (this.$ev instanceof DeletedMessageEvent) {
			return this.$ev.deletedIds[0];
		}

		if (this.$ev instanceof CallbackQueryEvent) {
			return this.$ev.messageId;
		}

		return this.$ev.message.id;
	}

	get cached(): MessageOnCache | undefined {
		return this.$client.messages.get(this.messageId.toString());
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
		if (!(this.$ev instanceof NewMessageEvent)) {
			return undefined;
		}

		return this.$ev.message.entities;
	}

	protected get _args(): string[] {
		const cmdName = this.getCommandName();
		if (!cmdName) {
			return [];
		}

		return this.text.split(/\s+/g).slice(1);
	}

	async _process(): Promise<void> {
		const {command} = this;
		if (!command) {
			return;
		}

		await command._init(this);
	}
}
