import { Config as ConfigInstance } from '../Config'

export {}

declare global {
  class Config {
    static get<T>(key: string, defaultValue?: any): T
    load(configPath?: string): Promise<void>
    verifyPath(folderName?: string): string
    loadSync(configPath?: string): void
  }
}

const _global = global as any
_global.Config = ConfigInstance
