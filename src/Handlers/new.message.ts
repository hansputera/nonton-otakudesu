import {type MessageEvent} from '@structures/Message.js';

export const handlerNewMessage = async (event: MessageEvent) => {
	console.log(event);
};
