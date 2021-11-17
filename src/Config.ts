import logger from './utils/logger'

import { parse } from 'path'
import { Env } from '@secjs/env'
import { getFolders } from '@secjs/utils'
import { FileContract } from '@secjs/contracts'
import { InternalServerException } from '@secjs/exceptions'

export class Config {
  private static configs: Map<string, any> = new Map()

  constructor() {
    Config.configs.clear()
  }

  static get<T>(key: string, defaultValue = undefined): T {
    const [mainKey, ...keys] = key.split('.')

    let config = this.configs.get(mainKey)

    if (keys.length) {
      keys.forEach(key => {
        if (!config) return

        config = config[key]
      })
    }

    if (!config) config = Env(mainKey, defaultValue)

    return config
  }

  async load() {
    // Important to load all envs in process.env
    Env('NODE_ENV', '')

    const path = `${process.cwd()}/config`

    const { files } = await getFolders(path, true)

    files.forEach(file => this.loadOnDemand(`${path}/${file.name}`, files, 0))

    return this
  }

  private loadOnDemand(path: string, files: FileContract[], callNumber = 0) {
    const { dir, name, base } = parse(path)
    const file = files.find(file => file.name === base)

    if (!file) return
    if (Config.configs.get(name)) return

    if (callNumber > 500) {
      const content = `Your config file ${base} is using Config.get() to an other config file that is using a Config.get('${name}*'), creating a infinite recursive call.`

      throw new InternalServerException(content)
    }

    if (typeof file.value === 'string' && file.value.includes('Config.get')) {
      const matches = file.value.match(/\(([^)]+)\)/g)

      for (const match of matches) {
        const filePath = `${dir}/${
          match.replace(/[(^)']/g, '').split('.')[0]
        }.ts`

        this.loadOnDemand(filePath, files, callNumber + 1)
      }
    }

    logger.debug(`Loading ${name} configuration file`)
    Config.configs.set(name, require(`${dir}/${base}`).default)
  }
}
