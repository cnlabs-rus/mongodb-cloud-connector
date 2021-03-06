import {Db, MongoClient, MongoClientOptions} from 'mongodb';

function resolveUrl(dbName: string) {
    if (process.env.VCAP_SERVICES) {
        const parsed = JSON.parse(process.env.VCAP_SERVICES);
        if (!parsed.mongodb) {
            throw new Error(`Cannot find mongo service '${dbName}'`)
        }
        if (dbName === 'default') {
            return parsed.mongodb[0].credentials.uri
        }
        let filtered = parsed.mongodb.filter((s: any) => s.name == dbName);
        if (!filtered.length) {
            throw new Error(`Cannot find mongo service '${dbName}'`)
        }
        return filtered[0].credentials.uri
    }
    if (process.env.MONGODB_URL) {
        return `${process.env.MONGODB_URL}/${dbName}`;
    }
    return `mongodb://localhost:27017/${dbName}`;
}

let defaultMongoOptions = {
    poolSize: 10,
    autoReconnect: true,
    useNewUrlParser: true
};

let cachedDB: { [id: string] : Db; } = {};

export const clearCache = () => cachedDB = {};

export const db = async (dbName: string = 'default', options?: MongoClientOptions) => {
    if(!process.env.VCAP_SERVICES && options) {
        delete options.replicaSet;
    }
    if (!cachedDB[dbName]) {
        return MongoClient.connect(resolveUrl(dbName), {...defaultMongoOptions, ...options}).then(database => {
            cachedDB[dbName] = database.db();
            return cachedDB[dbName];
        });
    }
    return Promise.resolve(cachedDB[dbName]);
};

