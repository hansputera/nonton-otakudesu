import {Command} from '@structures/Command.js';
import {type MessageEvent} from '@structures/Message.js';
import {registerCommand} from '@utilities/object.js';

class PingCommand extends Command {
	async handle(event: MessageEvent): Promise<void> {
		await event.reply(`Pong! (unix: ${Date.now().toString()})`);
	}
}

export default registerCommand(PingCommand, {
	name: 'ping',
	description: 'Just simple command to test the bot is working',
	aliases: ['pong'],
	flags: [],
	args: [],
	category: 'utilities',
	editable: true,
});
