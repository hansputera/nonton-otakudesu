import {type MessageEvent} from '@structures/Message.js';

export const handlerNewMessage = async (m: MessageEvent) => {
	await m._process();
};
