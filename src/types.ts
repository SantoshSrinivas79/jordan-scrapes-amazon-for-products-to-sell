export interface IConfig {
    mongoUser: string;
    mongoPass: string;
    mongoUrl: string;
    mongoDb: string;
    mongoCollection: string;
    webhookUrl?: string;
}
