import { config } from 'dotenv';

config();

export interface IEnvironmentConfig {
  environmentName: string;
  configPath: string;
}

const ci = process.argv.slice(2).indexOf('--ci') !== -1;
if (ci) { process.env.SPAUTH_ENV = 'production'; }

export const Environments: IEnvironmentConfig[] = ((headless: boolean) => {
  if (headless) {
    const ciTestConf: IEnvironmentConfig[] = [{
      environmentName: 'SharePoint Online',
      configPath: './config/integration/private.spo.json'
    }];
    return ciTestConf;
  }
  const privateConf: IEnvironmentConfig[] = [
    {
      environmentName: 'SharePoint Online',
      configPath: './config/integration/private.spo.json'
    },
    {
      environmentName: 'On-Premise 2016',
      configPath: './config/integration/private.2016.json'
    },
    {
      environmentName: 'On-Premise 2013',
      configPath: './config/integration/private.2013.json'
    }
  ];
  return privateConf;
})(ci);
