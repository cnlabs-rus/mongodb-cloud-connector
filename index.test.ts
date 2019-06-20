import {MongoClient} from 'mongodb';

import {clearCache, db} from "./index";

jest.mock('mongodb');

describe("tests", () => {
    beforeEach(() => {
        (MongoClient.connect as jest.Mock).mockClear();
        clearCache();
        process.env = {};
    });

    test('CLEAN_ENV: initialize db with default options', async () => {
        const expectedDatabase = {
            db: () => {
                return {"i'm": 'database'}
            }
        };
        (MongoClient.connect as jest.Mock).mockResolvedValue(expectedDatabase);
        expect(await db()).toEqual({"i'm": 'database'});
        expect((MongoClient.connect as jest.Mock).mock.calls).toEqual([["mongodb://localhost:27017/default", {
            poolSize: 10,
            autoReconnect: true,
            useNewUrlParser: true
        }]])
    });

    test('CLEAN_ENV: named database', async () => {
        const expectedDatabase = {
            db: () => {
                return {"i'm": 'database'}
            }
        };
        (MongoClient.connect as jest.Mock).mockResolvedValue(expectedDatabase);
        expect(await db("name")).toEqual({"i'm": 'database'});
        expect((MongoClient.connect as jest.Mock).mock.calls).toEqual([["mongodb://localhost:27017/name", {
            poolSize: 10,
            autoReconnect: true,
            useNewUrlParser: true
        }]])
    });

    test('CLEAN_ENV: additional options', async () => {
        const expectedDatabase = {
            db: () => {
                return {"i'm": 'database'}
            }
        };
        (MongoClient.connect as jest.Mock).mockResolvedValue(expectedDatabase);
        expect(await db("name", {appname: "XXX"})).toEqual({"i'm": 'database'});
        expect((MongoClient.connect as jest.Mock).mock.calls).toEqual([["mongodb://localhost:27017/name", {
            appname: "XXX",
            poolSize: 10,
            autoReconnect: true,
            useNewUrlParser: true
        }]])
    });

    test('CLEAN_ENV: override options', async () => {
        const expectedDatabase = {
            db: () => {
                return {"i'm": 'database'}
            }
        };
        (MongoClient.connect as jest.Mock).mockResolvedValue(expectedDatabase);
        expect(await db("name", {poolSize: 11})).toEqual({"i'm": 'database'});
        expect((MongoClient.connect as jest.Mock).mock.calls).toEqual([["mongodb://localhost:27017/name", {
            poolSize: 11,
            autoReconnect: true,
            useNewUrlParser: true
        }]])
    });

    test('ENV_VARIABLE: default', async () => {
        process.env.MONGODB_URL = 'AAAAA';
        const expectedDatabase = {
            db: () => {
                return {"i'm": 'database'}
            }
        };
        (MongoClient.connect as jest.Mock).mockResolvedValue(expectedDatabase);
        expect(await db()).toEqual({"i'm": 'database'});
        expect((MongoClient.connect as jest.Mock).mock.calls).toEqual([["AAAAA/default", {
            poolSize: 10,
            autoReconnect: true,
            useNewUrlParser: true
        }]])
    });

    test('ENV_VARIABLE: named', async () => {
        process.env.MONGODB_URL = 'AAAAA';
        const expectedDatabase = {
            db: () => {
                return {"i'm": 'database'}
            }
        };
        (MongoClient.connect as jest.Mock).mockResolvedValue(expectedDatabase);
        expect(await db("name")).toEqual({"i'm": 'database'});
        expect((MongoClient.connect as jest.Mock).mock.calls).toEqual([["AAAAA/name", {
            poolSize: 10,
            autoReconnect: true,
            useNewUrlParser: true
        }]])
    });

    test('CLOUD_FOUNDRY: default', async () => {
        process.env.VCAP_SERVICES = '{"mongodb":[{"credentials":{"uri":"CLOUD_URI"},"name":"mng1"}]}';
        const expectedDatabase = {
            db: () => {
                return {"i'm": 'database'}
            }
        };
        (MongoClient.connect as jest.Mock).mockResolvedValue(expectedDatabase);
        expect(await db()).toEqual({"i'm": 'database'});
        expect((MongoClient.connect as jest.Mock).mock.calls).toEqual([["CLOUD_URI", {
            poolSize: 10,
            autoReconnect: true,
            useNewUrlParser: true
        }]])
    });

    test('CLOUD_FOUNDRY: named', async () => {
        process.env.VCAP_SERVICES = '{"mongodb":[{"credentials":{"uri":"CLOUD_URI1"},"name":"mng1"},{"credentials":{"uri":"CLOUD_URI2"},"name":"mng2"}]}';
        const expectedDatabase = {
            db: () => {
                return {"i'm": 'database'}
            }
        };
        (MongoClient.connect as jest.Mock).mockResolvedValue(expectedDatabase);
        expect(await db("mng2")).toEqual({"i'm": 'database'});
        expect((MongoClient.connect as jest.Mock).mock.calls).toEqual([["CLOUD_URI2", {
            poolSize: 10,
            autoReconnect: true,
            useNewUrlParser: true
        }]])
    });

    test('CLOUD_FOUNDRY: named not foiund', async () => {
        process.env.VCAP_SERVICES = '{"mongodb":[{"credentials":{"uri":"CLOUD_URI1"},"name":"mng1"},{"credentials":{"uri":"CLOUD_URI2"},"name":"mng2"}]}';
        const expectedDatabase = {
            db: () => {
                return {"i'm": 'database'}
            }
        };
        (MongoClient.connect as jest.Mock).mockResolvedValue(expectedDatabase);
        try {
            await db("mng3");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e.message).toBe("Cannot find mongo service 'mng3'");
        }

    });

    test('CLOUD_FOUNDRY: default - no mongo at all', async () => {
        process.env.VCAP_SERVICES = '{}';
        const expectedDatabase = {
            db: () => {
                return {"i'm": 'database'}
            }
        };
        (MongoClient.connect as jest.Mock).mockResolvedValue(expectedDatabase);
        try {
            await db("mng3");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e.message).toBe("Cannot find mongo service 'mng3'");
        }

    });

    test("return cached instance", async () => {
        const expectedDatabase1 = {
            db: () => {
                return {"i'm": 'database1'}
            }
        };
        const expectedDatabase2 = {
            db: () => {
                return {"i'm": 'database2'}
            }
        };
        (MongoClient.connect as jest.Mock)
            .mockResolvedValueOnce(expectedDatabase1)
            .mockResolvedValue(expectedDatabase2);
        const first = await db("mng3", {appname: "XXX"});
        const second = await db("mng3");
        expect(first).toEqual({"i'm": 'database1'});
        expect(second).toEqual({"i'm": 'database1..5.'});
    });

    test("return cached instance by name", async () => {
        const expectedDatabase1 = {
            db: () => {
                return {"i'm": 'database1'}
            }
        };
        const expectedDatabase2 = {
            db: () => {
                return {"i'm": 'database2'}
            }
        };
        (MongoClient.connect as jest.Mock).mockImplementation((name: string) => {
            return Promise.resolve(name.endsWith('mng1') ? expectedDatabase1 : expectedDatabase2)
        });
        const first = await db("mng1");
        const second = await db("mng2");
        expect(first).toEqual({"i'm": 'database1'});
        expect(second).toEqual({"i'm": 'database2'});
    });

});