import { Config } from '../Config'

export {}

declare global {
  class Config {
    static get<T>(key: string, defaultValue?: any): T
  }
}

const _global = global as any
_global.Config = Config
