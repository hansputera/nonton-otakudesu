import process from 'node:process';
import {getVarsFromObject} from '@utilities/object.js';

import {TelegramFramework} from '@frameworks/GramJs.js';
import {type GramProps} from '@typings/frameworks.gramjs.js';
import {handlerNewMessage} from '@handlers/new.message.js';

import {NewMessage} from 'telegram/events/NewMessage.js';

async function bootBotCall() {
	const client = new TelegramFramework(
		getVarsFromObject(process.env, ['API_HASH', 'API_ID', 'BOT_TOKEN']) as GramProps,
	);

	client.addEventHandler(handlerNewMessage, new NewMessage());
	await client.launch({
		onError(err) {
			console.log('Error: ', err.message);
		},
	});
}

void bootBotCall();
