import {type Command} from '@structures/Command.js';
import {type GramProps} from '@typings/frameworks.gramjs.js';
import {type MessageOnCache} from '@typings/message.js';
import QuickLRU from 'quick-lru';

import {TelegramClient} from 'telegram';
import {type UserAuthParams} from 'telegram/client/auth.js';
import {StringSession} from 'telegram/sessions/StringSession.js';

import utilPingCommand from '@commands/Utilities/Ping.js';
import utilStartCommand from '@commands/Utilities/Start.js';

export class TelegramFramework extends TelegramClient {
	public messages = new QuickLRU<string, MessageOnCache>({
		maxSize: 512,
		maxAge: (60 * 1_000) * 5,
	});

	public commands = new QuickLRU<string, Command>({
		maxSize: 512,
	});

	/**
     * @param props TelegramFramework init props
     */
	constructor(private readonly props: GramProps) {
		super(new StringSession(''), parseInt(props.API_ID, 10), props.API_HASH, {
			connectionRetries: 5,
			deviceModel: 'UtekeeDesuNee',
			langCode: 'id',
			autoReconnect: true,
			systemLangCode: 'en',
		});
	}

	async launch(params: Omit<UserAuthParams, 'qrCode' | 'forceSMS' | 'phoneCode' | 'password' | 'phoneNumber'>): Promise<void> {
		this.registerCommands();
		return this.start({
			...params,
			botAuthToken: this.props.BOT_TOKEN,
		});
	}

	protected registerCommands(): void {
		utilPingCommand(this);
		utilStartCommand(this);
	}
}
