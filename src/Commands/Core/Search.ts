import {Odesus, Util} from 'odesus';
import {Api} from 'telegram';
import {Command} from '@structures/Command.js';
import {type MessageEvent} from '@structures/Message.js';
import {chunk, registerCommand} from '@utilities/object.js';

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

		const slug2buff = (url: string): Buffer => {
			const resolved = Util.resolveSlug(url);

			return Buffer.from(`${resolved!.type}/${resolved!.slug}`, 'utf8');
		};

		const buttonsChunked = chunk(results.map((val, index) => new Api.KeyboardButtonCallback({
			text: (index + 1).toString(),
			data: slug2buff(val.url),
		})), 5);

		await event.reply(`**Lists:**\n${results.map(
			(value, index) => `${index + 1}. ${value.name}`,
		).join('\n')}`, {
			parseMode: 'markdown',
			buttons: buttonsChunked,
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
	editable: true,
});
