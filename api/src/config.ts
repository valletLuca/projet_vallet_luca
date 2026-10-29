export interface DatabaseConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  bdname: string;
}

export interface AppConfig {
  BDD: DatabaseConfig;
}

// Utilisé seulement si DATABASE_URL pas défini
export const config: AppConfig = {
  BDD: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "5432",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    bdname: process.env.DB_NAME || "pollution_db"
  }
};

export const { BDD } = config;
export default config;
