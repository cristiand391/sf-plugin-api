module.exports = {
  extends: ['eslint-config-salesforce-typescript', 'plugin:sf-plugin/recommended'],
  rules: {
    'sf-plugin/no-missing-messages': 'off',
    'sf-plugin/no-hardcoded-messages-commands': 'off',
    'sf-plugin/no-hardcoded-messages-flags': 'off'
  }
};
