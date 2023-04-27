import {Command} from '@structures/Command.js';
import {type MessageEvent} from '@structures/Message.js';
import {registerCommand} from '@utilities/object.js';
import {Api} from 'telegram';

class StartCommand extends Command {
	async handle(event: MessageEvent): Promise<void> {
		await event.reply('Halo cuy! Mau bantu aku lebih berkembang? Klik aja tombol "Kontribusi" dibawah', {
			buttons: new Api.KeyboardButtonUrl({
				text: 'Kontribusi',
				url: 'https://github.com/hansputera/nonton-otakudesu',
			}),
		});
	}
}

export default registerCommand(StartCommand, {
	name: 'start',
	description: 'A start command to test the bot',
	aliases: ['mulai'],
	flags: [],
	args: [],
	category: 'utilities',
	editable: true,
});
