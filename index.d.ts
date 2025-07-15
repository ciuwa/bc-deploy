declare module 'bc-depoly' {
  import { ClientOptions } from 'basic-ftp';

  export interface GitCommitOptions {
    branch?: string;
    message?: string;
    skipTag?: boolean;
    onError?: (err: Error) => void;
  }

  export function uploadToFTP(
    config: ClientOptions,
    localPath: string,
    remotePath: string
  ): Promise<void>;

  export function updateVersion(): string;

  export function getCurrentVersion(): string;

  export function gitCommit(options?: GitCommitOptions): void;

  export function moveFiles(sourceDir: string, targetDir: string): void;

  export function copyDirectory(sourceDir: string, targetDir: string): void;
}