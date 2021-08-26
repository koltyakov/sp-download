import { config } from 'dotenv';
import { AuthConfig, IAuthContext } from 'node-sp-auth-config';

config();

const ci = process.argv.slice(2).indexOf('--ci') !== -1;
if (ci) { process.env.SPAUTH_ENV = 'production'; }

export const getContext = (configPath?: string): Promise<IAuthContext> => {

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      encryptPassword: true,
      saveConfigOnDisk: false
    });
  }

  return authConfig.getContext();
};
