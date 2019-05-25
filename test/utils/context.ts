import { config } from 'dotenv';
import { AuthConfig } from 'node-sp-auth-config';

config();

const ci = process.argv.slice(2).indexOf('--ci') !== -1;
if (ci) { process.env.SPAUTH_ENV = 'production'; }

export const getContext = (configPath?: string) => {

  let authConfig: AuthConfig;

  if (!ci) {
    authConfig = new AuthConfig({
      configPath,
      encryptPassword: true,
      saveConfigOnDisk: true
    });
  } else {
    authConfig = new AuthConfig({
      authOptions: {
        siteUrl: process.env.SPAUTH_SITEURL,
        username: process.env.SPAUTH_USERNAME,
        password: process.env.SPAUTH_PASSWORD
      } as any,
      encryptPassword: true,
      saveConfigOnDisk: false
    });
  }

  return authConfig.getContext();
};
