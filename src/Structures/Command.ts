import {type Arg, type CommandProps} from '@typings/command.js';
import {type MessageEvent} from './Message.js';
import {type TelegramFramework} from '@frameworks/GramJs.js';
import {ArgumentException} from '@exceptions/ArgumentException.js';

export class Command {
	protected client!: TelegramFramework;

	/**
     * @param props Command properties
     */
	constructor(public readonly props: CommandProps) {}

	public getArgument(key: string): Arg | undefined {
		if (Array.isArray(this.props.args)) {
			return this.props.args.find(arg => arg.name === key.toLowerCase());
		}

		return this.props.args;
	}

	async handle(event: MessageEvent): Promise<void> {
		await event.reply('Hello World!');
	}

	async _init(event: MessageEvent): Promise<void> {
		this.client = event.$client;

		this.processArg(event);
		return this.handle(event);
	}

	protected processArg(event: MessageEvent) {
		const copiedArgs = Array.from(
			Array.isArray(this.props.args) ? this.props.args : [this.props.args],
		);
		const rawArgs = Array.from(event.args);

		copiedArgs.forEach((arg, index) => {
			if (arg.isOption) {
				const optionValue = event.getArgOption(arg.name);
				if (!optionValue?.length) {
					const exception = new ArgumentException(arg);
					throw exception;
				} else if (isNaN(parseInt(optionValue, 10)) && arg.type === 'number') {
					const exception = new ArgumentException(arg);
					throw exception;
				}

				Reflect.set(arg, 'value', arg.type === 'number' ? parseInt(
					optionValue, 10) : optionValue);

				Reflect.set(this.props.args, index, arg);
				Reflect.deleteProperty(copiedArgs, index);
			} else {
				Reflect.set(arg, 'value', Array.isArray(this.props.args) ? rawArgs.shift()
					: rawArgs.join(' '));

				if (!arg.value?.length) {
					const exception = new ArgumentException(arg);
					throw exception;
				} else if (isNaN(parseInt(arg.value, 10)) && arg.type === 'number') {
					const exception = new ArgumentException(arg);
					throw exception;
				}

				Reflect.set(this.props.args, index, arg);
				Reflect.deleteProperty(copiedArgs, index);
			}
		});
	}
}
