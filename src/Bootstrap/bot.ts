import process from 'node:process';
import {getVarsFromObject} from '@utilities/object.js';

import {TelegramFramework} from '@frameworks/GramJs.js';
import {type GramProps} from '@typings/frameworks.gramjs.js';
import {MessageEvent} from '@structures/Message.js';

import {handlerNewMessage} from '@handlers/new.message.js';
import {handlerEditMessage} from '@handlers/edited.message.js';
import {handlerDeletedMessage} from '@handlers/deleted.message.js';

import {NewMessage} from 'telegram/events/NewMessage.js';
import {EditedMessage} from 'telegram/events/EditedMessage.js';
import {DeletedMessage} from 'telegram/events/DeletedMessage.js';

async function bootBotCall() {
	const client = new TelegramFramework(
		getVarsFromObject(process.env, ['API_HASH', 'API_ID', 'BOT_TOKEN']) as GramProps,
	);

	client.addEventHandler(async ev => handlerNewMessage(new MessageEvent(ev, client)), new NewMessage({}));
	client.addEventHandler(async ev => handlerEditMessage(new MessageEvent(ev, client)), new EditedMessage({}));
	client.addEventHandler(async ev => handlerDeletedMessage(new MessageEvent(ev, client)), new DeletedMessage({}));

	await client.launch({
		onError(err) {
			console.log('Error: ', err.message);
		},
	});
}

void bootBotCall();
