import { readFile } from 'node:fs/promises';
import { EOL } from 'node:os';
import got, { Headers, Method } from 'got';
import * as chalk from 'chalk';
import { ProxyAgent } from 'proxy-agent';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { SfError, Org } from '@salesforce/core';
import { Args, ux } from '@oclif/core';

export class OrgApi extends SfCommand<void> {
  public static readonly summary =
    'Makes an authenticated HTTP request to the Salesforce REST API and prints the response.';
  public static readonly description =
    'You must specify a Salesforce org to use, either with the --target-org flag or by setting your default org with the `target-org` configuration variable.';
  public static readonly examples = [
    {
      description: 'List information about limits in your org:',
      command:
        "<%= config.bin %> <%= command.id %> 'services/data/v56.0/limits' --target-org my-org",
    },
    {
      description:
        'Get response in XML format by specifying the "Accept" HTTP header:',
      command:
        "<%= config.bin %> <%= command.id %> 'services/data/v56.0/limits' --target-org my-org --header 'Accept: application/xml'",
    },
  ];
  public static enableJsonFlag = false;
  public static readonly flags = {
    // FIXME: getting a false positive from this eslint rule.
    // summary is already set in the org flag.
    // eslint-disable-next-line sf-plugin/flag-summary
    'target-org': Flags.requiredOrg({
      // TODO: this is already set in the org flag but getting a wrong type if not set here.
      // Fix flag types in oclif.
      required: true,
      helpValue: 'username',
    }),
    include: Flags.boolean({
      char: 'i',
      summary: 'Include HTTP response status and headers in the output.',
      default: false,
    }),
    method: Flags.custom<Method>({
      options: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'HEAD',
        'DELETE',
        'OPTIONS',
        'TRACE',
      ],
      summary: 'The HTTP method for the request.',
      char: 'X',
      default: 'GET',
    })(),
    header: Flags.string({
      summary: 'HTTP header in "key:value" format.',
      helpValue: 'key:value',
      char: 'H',
      multiple: true,
    }),
    body: Flags.file({
      summary: 'The file to use as the body for the request.',
      helpValue: 'file',
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
        throw new SfError(`Failed to parse HTTP header: "${header}".`, '', [
          'Make sure the header is in a "key:value" format, e.g. "Accept: application/json"',
        ]);
      }
      headers[split[0]] = split[1].trim();
    }

    return headers;
  }

  public async run(): Promise<void> {
    const { flags, args } = await this.parse(OrgApi);

    const org = flags['target-org'];

    await org.refreshAuth();

    const url = `${org.getField<string>(Org.Fields.INSTANCE_URL)}/${
      args.endpoint
    }`;

    const res = await got(url, {
      agent: { https: new ProxyAgent() },
      method: flags.method,
      headers: {
        Authorization: `Bearer ${
          // we don't care about apiVersion here, just need to get the access token.
          // eslint-disable-next-line sf-plugin/get-connection-with-version
          org.getConnection().getConnectionOptions().accessToken
        }`,
        ...(flags.header ? OrgApi.getHeaders(flags.header) : {}),
      },
      body:
        flags.method === 'GET'
          ? undefined
          : flags.body
          ? await readFile(flags.body)
          : undefined,
      throwHttpErrors: false,
    });

    // Print HTTP response status and headers.
    if (flags.include) {
      let httpInfo = `HTTP/${res.httpVersion} ${res.statusCode} ${EOL}`;

      for (const [header] of Object.entries(res.headers)) {
        httpInfo += `${chalk.blue.bold(header)}: ${
          res.headers[header] as string
        }${EOL}`;
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
