import {type MessageEvent} from '@structures/Message.js';

export const handlerNewMessage = async (m: MessageEvent) => {
	console.log(m.event);
};
