import mysql from 'mysql2/promise';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import { GoogleAuth } from 'google-auth-library';

const initPool = async () => {
    let authOptions = {};
    if (process.env.GCLOUD_KEY) {

        const serviceAccountJson = process.env.GCLOUD_KEY;

        if (!serviceAccountJson) {
            throw new Error("Missing GCLOUD_KEY env variable");
        }

        let safeJsonString = serviceAccountJson
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\n');
        authOptions = {
            auth: new GoogleAuth({
                credentials: JSON.parse(safeJsonString),
                scopes: ['https://www.googleapis.com/auth/sqlservice.admin'],
            })
        };
    }

    const connector = new Connector(authOptions);
    if (!process.env.DATABASE_CONNECTION_STRING) {
        throw new Error('DATABASE_CONNECTION_STRING is not defined');
    }
    if (!process.env.DATABASE_USER) {
        throw new Error('DATABASE_USER is not defined');
    }
    if (!process.env.DATABASE_PASSWORD) {
        throw new Error('DATABASE_PASSWORD is not defined');
    }
    if (!process.env.DATABASE) {
        throw new Error('DATABASE is not defined');
    }

    const clientOpts = await connector.getOptions({
        instanceConnectionName: process.env.DATABASE_CONNECTION_STRING,
        ipType: IpAddressTypes.PUBLIC,
    });

    return mysql.createPool({
        ...clientOpts,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
    });
};

const globalForDb = globalThis as unknown as {
    poolPromise: Promise<mysql.Pool> | undefined;
};

export const poolPromise = globalForDb.poolPromise ?? initPool();

