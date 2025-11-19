/// <reference types="vite/client" />

// Explicitly declare the global 'process' variable so TypeScript
// doesn't crash during the build (since we don't have @types/node installed)
declare const process: {
  env: {
    readonly API_KEY: string;
    [key: string]: string | undefined;
  }
};
