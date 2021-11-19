import { Config as ConfigInstance } from '../Config'

export {}

declare global {
  class Config {
    loadSync(configPath?: string): void
    load(configPath?: string): Promise<void>
    static verifyPath(folderName?: string): string
    static get<T>(key: string, defaultValue?: any): T
  }
}

const _global = global as any
_global.Config = ConfigInstance
