import { AuthConfig as SPAuthConfigirator } from 'node-sp-auth-config';
import * as colors from 'colors';
import * as path from 'path';

import { Environments } from './configs';

export async function checkOrPromptForIntegrationConfigCreds(): Promise<void> {

  for (const testConfig of Environments) {
    console.log(`\n=== ${colors.bold.yellow(`${testConfig.environmentName} Credentials`)} ===\n`);
    await (new SPAuthConfigirator({
      configPath: testConfig.configPath
    })).getContext();
    console.log(colors.grey(`Gotcha ${path.resolve(testConfig.configPath)}`));
  }

  console.log('\n');

}

if (process.argv.indexOf('--init') !== -1) {
  checkOrPromptForIntegrationConfigCreds();
}