declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    JWT_ACCESS_SECRET?: string;
    DIRECT_URL?: string;
  }
}

export {};
