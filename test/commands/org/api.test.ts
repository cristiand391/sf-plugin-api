import nock = require('nock');
import {
  TestContext,
  MockTestOrgData,
} from '@salesforce/core/lib/testSetup.js';
import { SfError } from '@salesforce/core';
import { expect } from 'chai';
import stripAnsi from 'strip-ansi';
import { OrgApi } from '../../../src/commands/org/api.js';

describe('org api', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData('1234', {
    username: 'cdominguez@sf-hub.com',
  });

  let stdoutSpy: sinon.SinonSpy;

  const orgLimitsResponse = {
    ActiveScratchOrgs: {
      Max: 200,
      Remaining: 199,
    },
  };

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    stdoutSpy = $$.SANDBOX.stub(process.stdout, 'write');
  });

  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('should request org limits and default to "GET" HTTP method', async () => {
    nock(testOrg.instanceUrl)
      .get('/services/data/v56.0/limits')
      .reply(200, orgLimitsResponse);

    await OrgApi.run([
      'services/data/v56.0/limits',
      '--target-org',
      'cdominguez@sf-hub.com',
    ]);

    const output = stripAnsi(stdoutSpy.args.flat().join(''));

    expect(JSON.parse(output)).to.deep.equal(orgLimitsResponse);
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

    await OrgApi.run([
      'services/data',
      '--header',
      'Accept: application/xml',
      '--target-org',
      'cdominguez@sf-hub.com',
    ]);

    const output = stripAnsi(stdoutSpy.args.flat().join(''));

    // https://github.com/oclif/core/blob/ff76400fb0bdfc4be0fa93056e86183b9205b323/src/command.ts#L248-L253
    expect(output).to.equal(xmlRes + '\n');
  });

  it('should validate HTTP headers are in a "key:value" format', async () => {
    try {
      await OrgApi.run([
        'services/data',
        '--header',
        'Accept application/xml',
        '--target-org',
        'cdominguez@sf-hub.com',
      ]);
    } catch (e) {
      const err = e as SfError;
      expect(err.message).to.equal(
        'Failed to parse HTTP header: "Accept application/xml".',
      );
      if (!err.actions || err.actions?.length === 0) {
        expect.fail('Missing action message for invalid header error.');
      }
      expect(err.actions[0]).to.equal(
        'Make sure the header is in a "key:value" format, e.g. "Accept: application/json"',
      );
    }
  });

  it('should not follow redirects', async () => {
    nock(testOrg.instanceUrl)
      .get('/services/data/v56.0/limites')
      .reply(301, orgLimitsResponse, {
        location: `${testOrg.instanceUrl}/services/data/v56.0/limits`,
      });

    await OrgApi.run([
      'services/data/v56.0/limites',
      '--target-org',
      'cdominguez@sf-hub.com',
    ]);

    const output = stripAnsi(stdoutSpy.args.flat().join(''));

    expect(JSON.parse(output)).to.deep.equal(orgLimitsResponse);
  });
});
