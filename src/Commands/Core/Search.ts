import {Odesus} from 'odesus';
import {Command} from '@structures/Command.js';
import {type MessageEvent} from '@structures/Message.js';
import {chunk, registerCommand} from '@utilities/object.js';
import {Api} from 'telegram';

export class SearchCommand extends Command {
	async handle(event: MessageEvent): Promise<void> {
		const query = this.getArgument('query');
		if (!query?.value) {
			return;
		}

		const odesu = new Odesus();
		const results = await odesu.search(query.value);

		if (!results.length) {
			await event.reply('No results found');
			return;
		}

		const buttonsChunked = chunk(results.map((val, index) => new Api.KeyboardButtonCallback({
			text: index.toString(),
			data: Buffer.from(val.url, 'utf8'),
		})), 3).map(b => new Api.KeyboardButtonRow({
			buttons: b,
		}));

		await event.reply(`**Lists:**\n${results.map(
			(value, index) => `${index + 1}. ${value.name}`,
		).join('\n')}`, {
			parseMode: 'Markdown',
			buttons: new Api.ReplyKeyboardMarkup({
				rows: buttonsChunked,
			}),
		});
	}
}

export default registerCommand(SearchCommand, {
	name: 'search',
	description: 'Search anime videos on telegram',
	aliases: ['cari', 'find'],
	category: 'core',
	flags: [],
	args: {
		name: 'query',
		required: true,
		type: 'text',
	},
});
