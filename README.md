# @cristiand391/sf-plugin-api

A Salesforce CLI plugin to interact with the Salesforce APIs.

[![NPM](https://img.shields.io/npm/v/@cristiand391/sf-plugin-api.svg?label=@cristiand391/sf-plugin-api)](https://www.npmjs.com/package/@cristiand391/sf-plugin-api) [![Downloads/week](https://img.shields.io/npm/dw/@cristiand391/sf-plugin-api.svg)](https://npmjs.org/package/@cristiand391/sf-plugin-api) 

## Install

```bash
sf plugins install @cristiand391/sf-plugin-api
```

## Commands

<!-- commands -->
* [`sf org api ENDPOINT`](#sf-org-api-endpoint)

## `sf org api ENDPOINT`

Makes an authenticated HTTP request to the Salesforce REST API and prints the response.

```
USAGE
  $ sf org api ENDPOINT -o <value> [-i] [-X GET|POST|PUT|PATCH|HEAD|DELETE|OPTIONS|TRACE] [-H <value>]
    [--body <value>]

ARGUMENTS
  ENDPOINT  Salesforce API endpoint

FLAGS
  -H, --header=key:value...  HTTP header in "key:value" format.
  -X, --method=<option>      [default: GET] The HTTP method for the request.
                             <options: GET|POST|PUT|PATCH|HEAD|DELETE|OPTIONS|TRACE>
  -i, --include              Include HTTP response status and headers in the output.
  -o, --target-org=username  (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
      --body=file            The file to use as the body for the request (use "-" to read from standard input).

DESCRIPTION
  Makes an authenticated HTTP request to the Salesforce REST API and prints the response.

  You must specify a Salesforce org to use, either with the --target-org flag or by setting your default org with the
  `target-org` configuration variable.

EXAMPLES
  List information about limits in your org:

    $ sf org api 'services/data/v56.0/limits' --target-org my-org

  Get response in XML format by specifying the "Accept" HTTP header:

    $ sf org api 'services/data/v56.0/limits' --target-org my-org --header 'Accept: application/xml'
```

_See code: [src/commands/org/api.ts](https://github.com/cristiand391/sf-plugin-api/blob/0.0.2/src/commands/org/api.ts)_
<!-- commandsstop -->
