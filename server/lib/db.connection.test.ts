import * as db from "./db.connection"
import { MongoMemoryServer } from "mongodb-memory-server"

describe('database connection', () => {
    let dbServer: MongoMemoryServer
    beforeAll(async () => dbServer = await MongoMemoryServer.create())
    afterAll(async () => await dbServer.stop())

    describe('config resolution', () => {
        it('should return default options', () => {
            const options = db.resolveOptions();
            expect(options).toHaveProperty('useNewUrlParser', true)
            expect(options).toHaveProperty('useUnifiedTopology', true)
            expect(Object.keys(options)).toHaveLength(2)
        })
        it.each([
            ["default options", undefined, undefined],
            ["global options", { appname: "globalApp" }, undefined],
            ["application options", undefined, { appname: "App" }],
            ["mixed options", { appname: "globalApp" }, { appname: "App" }],
        ])('should be able to resolve %s', (_, global, app) => {
            const options = db.resolveOptions({ global, app });
            expect(options).toHaveProperty('useNewUrlParser', true)
            expect(options).toHaveProperty('useUnifiedTopology', true)

            if (global === undefined && app === undefined) {
                expect(Object.keys(options)).toHaveLength(2)
                expect(options).not.toHaveProperty('appname')
            } else {
                expect(options).toHaveProperty('appname')

                if (global !== undefined && app === undefined) {
                    expect(options).toHaveProperty('appname', 'globalApp')
                } else if (app !== undefined) {
                    expect(options).toHaveProperty('appname', 'App')
                }
            }


        })
    })

    describe('create one connection', () => {
        const dbUnreachable = "mongodb://127.0.0.2:12345/?appname=toFailed&socketTimeoutMS=1&connectTimeoutMS=1&serverSelectionTimeoutMS=1&reconnectTries=0"
        let dbUri: string
        beforeAll(async () => dbUri = await dbServer.getUri())

        it('should successfully create a connection', async () => {
            const connection = await db.createConnection(dbUri, db.defaultOption)
            expect(connection.readyState).toBe(connection.states.connected)
        })

        it('should failed the connection creation', async () => {
            try {
                await db.createConnection(dbUnreachable, db.defaultOption)
            } catch (ex) {
                expect(String(ex)).toContain("MongooseServerSelectionError")
            }
        })

        it('should failed the connection creation with callback', async () => {
            const onError = jest.fn()
            try {
                await db.createConnection(dbUnreachable, db.defaultOption, onError)
            } catch (ex) {
                expect(onError).toBeCalledWith(dbUnreachable, db.defaultOption, ex)
            }
        })

    })
})

