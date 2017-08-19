export interface IEnvironmentConfig {
    environmentName: string;
    configPath: string;
}

export const Environments: IEnvironmentConfig[] = [
    {
        environmentName: 'SharePoint Online',
        configPath: './config/integration/private.spo.json'
    }, {
        environmentName: 'On-Premise 2016',
        configPath: './config/integration/private.2016.json'
    }, {
        environmentName: 'On-Premise 2013',
        configPath: './config/integration/private.2013.json'
    }
];
