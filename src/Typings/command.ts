import {type TelegramFramework} from '@frameworks/GramJs.js';
import {type Command} from '@structures/Command.js';

export type ArgType = 'text' | 'number';

export type Arg = {
	name: string;
	type: ArgType;
	value?: Arg['type'] extends 'number' ? number : string;
	isOption?: boolean;
	required?: boolean;
};

export type CommandProps = {
	name: string;
	description: string;
	aliases: string[];
	flags: string[];
	args: Arg[];
	category: string;
	editable?: boolean;
};

export type RegisterCommandFn = <T extends typeof Command>(instance: T, props: CommandProps) => (
	$client: TelegramFramework
) => void;
