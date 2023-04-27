import {type MessageEvent} from '@structures/Message.js';

export const handlerEditMessage = async (m: MessageEvent) => {
	await m._process();
};
