/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { readFile } from 'node:fs/promises';
import got, { Headers, Method } from 'got';
import * as chalk from 'chalk';
import * as ProxyAgent from 'proxy-agent';
import { getProxyForUrl } from 'proxy-from-env';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { SfError, Messages, Org } from '@salesforce/core';
import { Args, ux } from '@oclif/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@cristiand391/sf-plugin-api', 'env.api');

export default class EnvApi extends SfCommand<void> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');
  public static enableJsonFlag = false;
  public static flags = {
    'target-org': Flags.requiredOrg({
      // TODO: this is already set in the org flag but getting a wrong type if not set here.
      // Fix flag types in oclif.
      required: true,
    }),
    include: Flags.boolean({
      char: 'i',
      summary: messages.getMessage('flags.include.summary'),
      default: false,
    }),
    method: Flags.custom<Method>({
      options: ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'],
      summary: messages.getMessage('flags.method.summary'),
      char: 'X',
      default: 'GET',
    })(),
    header: Flags.string({
      summary: messages.getMessage('flags.header.summary'),
      char: 'H',
      multiple: true,
    }),
    body: Flags.file({
      summary: messages.getMessage('flags.body.summary'),
    }),
  };

  public static args = {
    endpoint: Args.string({
      description: 'Salesforce API endpoint',
      required: true,
    }),
  };

  private static getHeaders(keyValPair: string[]): Headers {
    const headers: { [key: string]: string } = {};

    for (const header of keyValPair) {
      const split = header.split(':');
      if (split.length !== 2) {
        throw new SfError(messages.getMessage('errors.invalid-http-header', [header]), '', [
          'Make sure the header is in a "key:value" format, e.g. "Accept: application/json"',
        ]);
      }
      headers[split[0]] = split[1].trim();
    }

    return headers;
  }

  public async run(): Promise<void> {
    const { flags, args } = await this.parse(EnvApi);

    const org = flags['target-org'];

    await org.refreshAuth();

    const url = `${org.getField<string>(Org.Fields.INSTANCE_URL)}/${args.endpoint}`;

    const res = await got(url, {
      agent: { https: ProxyAgent(getProxyForUrl(url)) },
      method: flags.method,
      headers: {
        Authorization: `Bearer ${org.getConnection().getConnectionOptions().accessToken}`,
        ...(flags.header ? EnvApi.getHeaders(flags.header) : {}),
      },
      body: flags.method === 'GET' ? undefined : flags.body ? await readFile(flags.body) : undefined,
      throwHttpErrors: false,
    });

    // Print HTTP response status and headers.
    if (flags.include) {
      let httpInfo = `HTTP/${res.httpVersion} ${res.statusCode} \n`;

      for (const [header] of Object.entries(res.headers)) {
        httpInfo += `${chalk.blue.bold(header)}: ${res.headers[header] as string}\n`;
      }
      this.log(httpInfo);
    }

    try {
      // Try to pretty-print JSON response.
      ux.styledJSON(JSON.parse(res.body));
    } catch (err) {
      // If response body isn't JSON, just print it to stdout.
      this.log(res.body);
    }

    if (res.statusCode >= 400) {
      process.exitCode = 1;
    }
  }
}
