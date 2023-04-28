import {getRepository} from '@database/repository.js';
import {type PreProcessButton} from '@typings/internal.js';
import {dechunk} from '@utilities/object.js';

export const $saveButtons = async (buttons: PreProcessButton[] | PreProcessButton[][]) => {
	if (!buttons.length) {
		return false;
	}

	if (buttons.length && Array.isArray(buttons[0])) {
		buttons = dechunk(buttons as PreProcessButton[][]);
	}

	const repository = getRepository('button')!;
	await repository.insert((buttons as PreProcessButton[]).map(btn => ({
		key: btn.key,
		value: btn.value,
		chatId: btn.props.chatId.toJSNumber(),
		userId: btn.props.userId.toJSNumber(),
		messageId: btn.props.messageId,
		expireAt: new Date(Date.now() + (60_000 * 5)),
	})));

	return true;
};
