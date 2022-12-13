# @cristiand391/sf-plugin-api

A Salesforce CLI plugin to interact with the Salesforce APIs.

[![NPM](https://img.shields.io/npm/v/@cristiand391/sf-plugin-api.svg?label=@cristiand391/sf-plugin-api)](https://www.npmjs.com/package/@cristiand391/sf-plugin-api) [![Downloads/week](https://img.shields.io/npm/dw/@cristiand391/sf-plugin-api.svg)](https://npmjs.org/package/@cristiand391/sf-plugin-api) 

## Install

```bash
sf plugins install @cristiand391/sf-plugin-api
```

## Commands

<!-- commands -->
* [`sf env api ENDPOINT`](#sf-env-api-endpoint)

## `sf env api ENDPOINT`

Makes an authenticated HTTP request to the Salesforce REST API and prints the response.

```
USAGE
  $ sf env api [ENDPOINT] [-o <value>] [-i] [-X GET|POST|PUT|PATCH|HEAD|DELETE|OPTIONS|TRACE] [-H <value>]
    [--body <value>]

ARGUMENTS
  ENDPOINT  Salesforce API endpoint.

FLAGS
  -H, --header=<value>...                                      HTTP header in "key:value" format.
  -X, --method=(GET|POST|PUT|PATCH|HEAD|DELETE|OPTIONS|TRACE)  [default: GET] The HTTP method for the request.
  -i, --include                                                Include HTTP response status and headers in the output.
  -o, --target-org=<value>                                     Login username or alias for the target org.
  --body=<value>                                               The file to use as the body for the request.

DESCRIPTION
  Makes an authenticated HTTP request to the Salesforce REST API and prints the response.

  You must specify a Salesforce org to use, either with the --target-org flag or by setting your default org with the
  `target-org` configuration variable.

  Read the Salesforce REST API developer guide at:
  https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_rest.htm

EXAMPLES
  List information about limits in your org:

    $ sf env api 'services/data/v56.0/limits' --target-org my-org

  Get response in XML format by specifying the "Accept" HTTP header:

    $ sf env api 'services/data/v56.0/limits' --target-org my-org --header 'Accept: application/xml'
```
<!-- commandsstop -->
