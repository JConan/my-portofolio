declare namespace NodeJS {
  export interface ProcessEnv {
    /** db.helper - mongo server URI */
    MONGODB_URI: string | undefined;

    /** Use by Mongod Memory Server - for Testing only */
    MONGOMS_VERSION: string | undefined;
    /** Use by Mongod Memory Server - for Testing only */
    MONGOMS_ARCH: string | undefined;

    /** Portofolio database (mongodb) */
    PORTOFOLIO_DB_URI: string;
    PORTOFOLIO_DB_USER: string;
    PORTOFOLIO_DB_PASSWORD: string;

    /** Vidly database (mongodb) */
    VIDLY_DB_URI: string;
    VIDLY_DB_USER: string;
    VIDLY_DB_PASSWORD: string;
  }
}
