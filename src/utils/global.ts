import { Config as ConfigInstance } from '../Config'

export {}

declare global {
  class Config {
    loadIfUnloaded(configPath?: string): void
    loadSync(configPath?: string): void
    load(configPath?: string): Promise<void>
    static verifyPath(folderName?: string): string
    static get<T = any>(key: string, defaultValue?: any): T | undefined
  }
}

const _global = global as any

new ConfigInstance().loadIfUnloaded()

_global.Config = ConfigInstance
