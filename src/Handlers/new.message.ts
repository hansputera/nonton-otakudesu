import {type NewMessageEvent} from 'telegram/events/NewMessage.js';

export const handlerNewMessage = async (event: NewMessageEvent) => {
	console.log(event);
};
