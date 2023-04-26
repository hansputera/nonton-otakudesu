import {type TelegramFramework} from '@frameworks/GramJs.js';
import {type MessageEvent} from '@structures/Message.js';

export const handlerNewMessage = async (event: MessageEvent, $client: TelegramFramework) => {
	console.log(event);
};
