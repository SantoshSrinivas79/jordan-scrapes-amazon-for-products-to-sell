import {config} from "./config";
import Webhook from 'webhook-discord';
import * as dbHelpers from 'database-helpers';


export const inDocker = (process.env.hasOwnProperty("PPTR_IN_DOCKER") && String(process.env.PPTR_IN_DOCKER) === 'true');

export const hook = (config.webhookUrl)
    ? new Webhook.Webhook(config.webhookUrl)
    : console;

// Since mongo, mongo-express, and this app will be
// launched by docker compose all at the same time
// mongo might not be ready to accept connections for a few seconds.
export const initializeMongo = async (attempts = 0, maxAttempts = 5) => {
    try {
        console.log(`mongo init attempt ${attempts + 1} out of ${maxAttempts}`);
        const dbUrl = `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoUrl}/${config.mongoDb}`;
        const db = await dbHelpers.initializeMongo(dbUrl);

        return db;
    } catch (err) {
        if (attempts < maxAttempts) {
            await wait(1500);
            return initializeMongo(attempts++);
        }

        console.error(`Could not connect to mongo after ${attempts} attempts`);
        console.error(err);
        process.exit(1);
    }
};

const wait = async (timeInMs: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeInMs);
    });
};
