# summary

Makes an authenticated HTTP request to the Salesforce REST API and prints the response.

# description

You must specify a Salesforce org to use, either with the --target-org flag or by setting your default org with the `target-org` configuration variable.

Read the Salesforce REST API developer guide at:
https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_rest.htm

# examples

- List information about limits in your org:

  <%= config.bin %> <%= command.id %> 'services/data/v56.0/limits' --target-org my-org

- Get response in XML format by specifying the "Accept" HTTP header:

  <%= config.bin %> <%= command.id %> 'services/data/v56.0/limits' --target-org my-org --header 'Accept: application/xml'

# flags.target-org.summary

Login username or alias for the target org.

# flags.method.summary

The HTTP method for the request.

# flags.include.summary

Include HTTP response status and headers in the output.

# flags.header.summary

HTTP header in "key:value" format.

# flags.body.summary

The file to use as the body for the request.

# errors.invalid-http-header

Failed to parse HTTP header: "%s".
