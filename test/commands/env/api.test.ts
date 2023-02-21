import * as path from 'path';
import nock = require('nock');
import { TestContext, MockTestOrgData } from '@salesforce/core/lib/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import stripAnsi = require('strip-ansi');
import EnvApi from '../../../src/commands/env/api';

describe('env api', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData('1234', { username: 'cdominguez@sf-hub.com' });
  let config: Config;

  let stdoutSpy: sinon.SinonSpy;
  let stderrSpy: sinon.SinonSpy;

  before(async () => {
    config = new Config({ root: path.resolve(__dirname, '../../..') });
    await config.load();
  });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    stdoutSpy = $$.SANDBOX.stub(process.stdout, 'write');
    stderrSpy = $$.SANDBOX.stub(process.stderr, 'write');
  });

  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('should request org limits and default to "GET" HTTP method', async () => {
    const orgLimitsResponse = {
      ActiveScratchOrgs: {
        Max: 200,
        Remaining: 199,
      },
    };

    nock(testOrg.instanceUrl).get('/services/data/v56.0/limits').reply(200, orgLimitsResponse);

    const cmd = new EnvApi(['services/data/v56.0/limits', '--target-org', 'cdominguez@sf-hub.com'], config);

    // eslint-disable-next-line no-underscore-dangle
    await cmd._run();

    const stdout = stripAnsi(stdoutSpy.args.flat().join(''));

    expect(JSON.parse(stdout)).to.deep.equal(orgLimitsResponse);
  });

  it('should set "Accept" HTTP header', async () => {
    const xmlRes = `<?xml version="1.0" encoding="UTF-8"?>
<LimitsSnapshot>
	<ActiveScratchOrgs>
		<Max>200</Max>
		<Remaining>198</Remaining>
	</ActiveScratchOrgs>
</LimitsSnapshot>`;

    nock(testOrg.instanceUrl, {
      reqheaders: {
        accept: 'application/xml',
      },
    })
      .get('/services/data')
      .reply(200, xmlRes);

    const cmd = new EnvApi(
      ['services/data', '--header', 'Accept: application/xml', '--target-org', 'cdominguez@sf-hub.com'],
      config
    );

    // eslint-disable-next-line no-underscore-dangle
    await cmd._run();

    const stdout = stripAnsi(stdoutSpy.args.flat().join(''));

    // https://github.com/oclif/core/blob/ff76400fb0bdfc4be0fa93056e86183b9205b323/src/command.ts#L248-L253
    expect(stdout).to.equal(xmlRes + '\n');
  });

  it('should validate HTTP headers are in a "key:value" format', async () => {
    const cmd = new EnvApi(
      ['services/data', '--header', 'Accept application/xml', '--target-org', 'cdominguez@sf-hub.com'],
      config
    );

    // eslint-disable-next-line no-underscore-dangle
    await cmd._run();

    const stderr = stripAnsi(stderrSpy.args.flat().join(''));

    expect(stderr).to.include('Make sure the header is in a "key:value" format, e.g. "Accept: application/json"');
  });
});
