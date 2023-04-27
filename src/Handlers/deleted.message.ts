import {type MessageEvent} from '@structures/Message.js';

export const handleDeletedMessage = async (m: MessageEvent) => {
	if (m.cached) {
		m.$client.messages.delete(m.$ev.message.id.toString());
	}
};
