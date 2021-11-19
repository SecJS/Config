import { Config as ConfigInstance } from '../Config'

export {}

declare global {
  class Config {
    static get<T>(key: string, defaultValue?: any): T
    load(): Promise<void>
    loadSync(): void
  }
}

const _global = global as any
_global.Config = ConfigInstance
