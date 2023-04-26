import {type EntityLike} from 'telegram/define.js';

export type MessageOnCache = {
	chat: EntityLike;
	lastResponseMessageId: string;
};
