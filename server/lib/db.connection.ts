import mongoose from "mongoose"


type connectionSuccess = { connection?: mongoose.Connection }
type connectionFailure = { error: string }
type connection = { uri: string, options?: mongoose.ConnectionOptions } & (connectionSuccess | connectionFailure)

export interface dbConfig {
    mongooseOptions?: mongoose.ConnectionOptions
    applications: {
        [name: string]: connection
    }
}

export const defaultOption: mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
interface options {
    global?: mongoose.ConnectionOptions
    app?: mongoose.ConnectionOptions
}
export const resolveOptions =
    (extraOptions?: options) => {
        const { global, app } = extraOptions || {}
        return { ...defaultOption, ...global, ...app }
    }

type onCreationErrorCallback = (uri: string, options: mongoose.ConnectionOptions, error: any) => void
export const createConnection = async (
    uri: string,
    options: mongoose.ConnectionOptions,
    onError?: onCreationErrorCallback) => {

    return new Promise<mongoose.Connection>(async (resolve, reject) => {
        mongoose.createConnection(uri, options)
            .then(connection => {
                resolve(connection)
            })
            .catch(err => {
                onError?.(uri, options, err)
                reject(err)
            })
    })
}


// export const connectDatabase = async (config: dbConfig): Promise<void> => {
//     const apps = Object.values(config.applications)
//     const promises = apps.map(app => new Promise<mongoose.Connection>(async (resolve, reject) => {
//         mongoose
//             .createConnection(app.uri, { ...defaultOption, ...(config.mongooseOptions), ...(app.options) })
//             .then(connection => resolve(connection))
//             .catch(error => reject(error))
//     }))
//     const results = promises.map(async (promise) => {
//         try {
//             return { connection: await promise }
//         } catch (ex) {
//             return { error: ex }
//         }
//     })
// }