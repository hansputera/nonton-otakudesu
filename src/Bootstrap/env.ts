import 'dotenv/config';
import process from 'node:process';
import {assertEnv} from '@utilities/assert-env.js';

// 0. env asserts
assertEnv(process.env);
