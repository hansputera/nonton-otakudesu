import {type Arg} from '@typings/command.js';

export class ArgumentException extends Error {
	/**
     * @param arg Arg Exception payload
     */
	constructor(private readonly arg: Arg) {
		super('');
	}

	required(): this {
		this.message = `'${this.arg.name}' is required`;
		return this;
	}

	invalid(message: string): this {
		this.message = `'${this.arg.name}' value is invalid because ${message}`;
		return this;
	}
}
