declare namespace NodeJS {
  export interface ProcessEnv {
    /** db.helper - mongo server URI */
    MONGODB_URI: string | undefined;

    /** Use by Mongod Memory Server - for Testing only */
    MONGOMS_VERSION: string | undefined;
    /** Use by Mongod Memory Server - for Testing only */
    MONGOMS_ARCH: string | undefined;
  }
}
