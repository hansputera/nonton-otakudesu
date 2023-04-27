import {type MessageEvent} from '@structures/Message.js';
import {DeletedMessageEvent} from 'telegram/events/DeletedMessage.js';

export const handlerDeletedMessage = async (m: MessageEvent) => {
	if (m.cached && m.$ev instanceof DeletedMessageEvent) {
		m.$client.messages.delete(m.$ev.deletedIds[0].toString());
	}
};
