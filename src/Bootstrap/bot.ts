import process from 'node:process';
import {getVarsFromObject} from '@utilities/object.js';

import {TelegramFramework} from '@frameworks/GramJs.js';
import {type GramProps} from '@typings/frameworks.gramjs.js';

import {handlerNewMessage} from '@handlers/new.message.js';
import {handlerEditMessage} from '@handlers/edited.message.js';

import {NewMessage} from 'telegram/events/NewMessage.js';
import {EditedMessage} from 'telegram/events/EditedMessage.js';

async function bootBotCall() {
	const client = new TelegramFramework(
		getVarsFromObject(process.env, ['API_HASH', 'API_ID', 'BOT_TOKEN']) as GramProps,
	);

	client.addEventHandler(async ev => handlerNewMessage(ev, client), new NewMessage({}));
	client.addEventHandler(async ev => handlerEditMessage(ev, client), new EditedMessage({}));
	await client.launch({
		onError(err) {
			console.log('Error: ', err.message);
		},
	});
}

void bootBotCall();
