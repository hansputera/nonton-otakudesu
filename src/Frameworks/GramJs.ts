import {type GramProps} from '@typings/frameworks.gramjs.js';
import {TelegramClient} from 'telegram';
import {type UserAuthParams} from 'telegram/client/auth.js';
import {StringSession} from 'telegram/sessions/StringSession.js';

export class TelegramFramework extends TelegramClient {
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
		return this.start({
			...params,
			botAuthToken: this.props.BOT_TOKEN,
		});
	}
}
