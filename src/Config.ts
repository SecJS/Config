import logger from './utils/logger'

import { parse } from 'path'
import { Env } from '@secjs/env'
import { getFolders } from '@secjs/utils'
import { FileContract } from '@secjs/contracts'
import { getFoldersSync } from './utils/getFoldersSync'
import { InternalServerException } from '@secjs/exceptions'

export class Config {
  private static configs: Map<string, any> = new Map()

  constructor() {
    const isInitialized = Config.configs.size >= 1

    if (isInitialized) {
      logger.debug(
        'Reloading the Config class has no effect on the configuration files, only for environment variables, as the files have already been loaded as Singletons',
      )
    }

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

    if (!config) config = this.configs.get(`env-${mainKey}`)
    if (!config) config = defaultValue

    return config
  }

  loadSync(configPath = '/config') {
    Config.loadEnvs()

    const path = `${process.cwd()}/${configPath}`

    const { files } = getFoldersSync(path, true)

    files.forEach(file => Config.loadOnDemand(`${path}/${file.name}`, files, 0))

    return this
  }

  async load(configPath = '/config') {
    Config.loadEnvs()

    const path = `${process.cwd()}/${configPath}`

    const { files } = await getFolders(path, true)

    files.forEach(file => Config.loadOnDemand(`${path}/${file.name}`, files, 0))

    return this
  }

  private static verifyPath(folderName = 'dist') {
    if (process.env.NODE_ENV === 'testing') return `/${folderName}/config`

    return '/config'
  }

  private static loadEnvs() {
    // Important to load all env files in process.env
    Env('NODE_ENV', '')

    Object.keys(process.env).forEach(key => {
      const envValue = process.env[key]

      this.configs.set(`env-${key}`, envValue)
    })
  }

  private static loadOnDemand(
    path: string,
    files: FileContract[],
    callNumber = 0,
  ) {
    const { dir, name, base } = parse(path)
    const file = files.find(file => file.name === base)

    if (!file) return
    if (this.configs.get(name)) return

    if (callNumber > 500) {
      const content = `Your config file ${base} is using Config.get() to an other config file that is using a Config.get('${name}*'), creating a infinite recursive call.`

      throw new InternalServerException(content)
    }

    if (typeof file.value === 'string' && file.value.includes('Config.get')) {
      const matches = file.value.match(/\(([^)]+)\)/g)

      for (const match of matches) {
        if (this.configs.get(`env-${match}`)) continue

        const filePath = `${dir}/${
          match.replace(/[(^)']/g, '').split('.')[0]
        }.ts`

        this.loadOnDemand(filePath, files, callNumber + 1)
      }
    }

    logger.debug(`Loading ${name} configuration file`)
    this.configs.set(name, require(`${dir}/${base}`).default)
  }
}
