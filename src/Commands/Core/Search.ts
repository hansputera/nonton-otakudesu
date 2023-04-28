import {Odesus} from 'odesus';
import {Command} from '@structures/Command.js';
import {type MessageEvent} from '@structures/Message.js';
import {registerCommand} from '@utilities/object.js';
import {buildButtons} from '@services/Internal/make-buttons.js';
import {$saveButtons} from '@services/Internal/save-buttons.js';

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

		const prebuiltButtons = buildButtons(results.map((r, index) => ({
			userId: event.userId!,
			chatId: event.$ev.chatId!,
			messageId: event.messageId,
			buttonValue: (index + 1).toString(),
			data: Buffer.from(`info;${r.url}`),
		})));

		await $saveButtons(prebuiltButtons.toPreProcess());
		await event.reply(`**Lists:**\n${results.map(
			(value, index) => `${index + 1}. ${value.name}`,
		).join('\n')}`, {
			parseMode: 'markdown',
			buttons: prebuiltButtons.toTelegram(),
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
