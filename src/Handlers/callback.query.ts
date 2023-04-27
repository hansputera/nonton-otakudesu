import {type MessageEvent} from '@structures/Message.js';
import {CallbackQueryEvent} from 'telegram/events/CallbackQuery.js';

export const handlerCallbackQuery = async (event: MessageEvent) => {
	if (event.$ev instanceof CallbackQueryEvent) {
		console.log(event.$ev, event.messageId);
	}
};
