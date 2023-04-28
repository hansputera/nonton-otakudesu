import {type Api} from 'telegram';

export type PreProcessButton = {
	button: Api.KeyboardButtonCallback;
	key: string;
	value: Buffer;
	props: {
		chatId: bigInt.BigInteger;
		userId: bigInt.BigInteger;
	};
};

export type CreatePreProcessButton = {
	chatId: bigInt.BigInteger;
	userId: bigInt.BigInteger;
	data: Buffer;
	buttonValue: string;
};

export type PrebuiltPreProcessButton = {
	toTelegram: () => Api.KeyboardButtonCallback[][];
	toPreProcess: () => PreProcessButton[][];
};
