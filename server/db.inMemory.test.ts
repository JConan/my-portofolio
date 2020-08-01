import dbInMemory from "./db.inMemory";
import mongoose, { Schema } from "mongoose"


describe('in mememory db - for unit testing purpose', () => {

    describe('connect & disconnect mutiple times', () => {
        const dbServer = dbInMemory.createServerConnection()

        beforeEach(async () => {
            expect.assertions(5);
            expect(dbServer.getUri()).toBe(false);
            try {
                await dbServer.disconnect()
            } catch (ex) {
                expect(ex).toBe('InMemoryServerDbConnection - nothing to close')
            }
            await dbServer.connect();
        })

        afterEach(async () => {
            await dbServer.disconnect();
            expect(mongoose.connection.readyState).not.toBe(mongoose.STATES.connected);
        })

        it.each([1, 2, 3, 4, 5])('should work', () => {
            expect(dbServer.getUri()).toMatch(/^mongodb:\/\/127.0.0.1:[0-9]+.*/i);
            expect(mongoose.connection.readyState).toBe(mongoose.STATES.connected);
        })
    })

})