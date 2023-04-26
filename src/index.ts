import '@boot/env.js';
import process from 'node:process';
import {getVarsFromObject} from '@utilities/object.js';

console.log(getVarsFromObject(process.env, ['BOT_TOKEN', 'API_ID']));
