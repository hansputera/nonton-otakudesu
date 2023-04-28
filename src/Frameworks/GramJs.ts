import {type Command} from '@structures/Command.js';
import {type GramProps} from '@typings/frameworks.gramjs.js';
import {type MessageOnCache} from '@typings/message.js';
import QuickLRU from 'quick-lru';

import {Api, TelegramClient} from 'telegram';
import {type UserAuthParams} from 'telegram/client/auth.js';
import {StoreSession} from 'telegram/sessions/StoreSession.js';

import coreSearchCommand from '@commands/Core/Search.js';
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
	 * @param session GramJS Session
     */
	constructor(private readonly props: GramProps, public readonly session = new StoreSession('.session')) {
		super(session, parseInt(props.API_ID, 10), props.API_HASH, {
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

	public async sendInline(
		queryId: bigInt.BigInteger,
		data: Api.TypeInputBotInlineResult[],
		cacheTime = 30,
		props?: {private?: boolean},
	) {
		await this.invoke(new Api.messages.SetInlineBotResults({
			queryId,
			cacheTime,
			results: data,
			private: props?.private,
		}));
	}

	protected registerCommands(): void {
		utilPingCommand(this);
		utilStartCommand(this);

		coreSearchCommand(this);
	}
}
