import {Command} from '@structures/Command.js';
import {type MessageEvent} from '@structures/Message.js';
import {registerCommand} from '@utilities/object.js';
import prettyBytes from 'pretty-bytes';
import * as os from 'node:os';
import stripIndent from 'strip-indent';

class SysInfoCommand extends Command {
	async handle(event: MessageEvent): Promise<void> {
		const cpus = os.cpus();
		const memuse = process.memoryUsage();

		await event.reply(stripIndent(`**Server's resources:**
1. Memory/RAM: ${prettyBytes(os.totalmem() - os.freemem())} used of ${prettyBytes(os.totalmem())} (${prettyBytes(os.freemem())} free)
2. CPU: ${cpus[0].model} (${cpus.length} core)
3. Platform, arch: ${os.type()} ${os.platform()}, ${os.arch()}
4. Kernel version: ${os.version()}

**Program:**
1. Memory/RAM: ${prettyBytes(memuse.heapUsed)} used of ${prettyBytes(memuse.heapTotal)}
2. NodeJS version: ${process.version} (V8: ${process.versions.v8})
    `));
	}
}

export default registerCommand(SysInfoCommand, {
	name: 'sysinfo',
	description: 'Show system information',
	aliases: ['sysinformation', 'systeminfo'],
	flags: [],
	args: [],
	category: 'utilities',
	editable: true,
});
