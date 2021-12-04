import { debugFn } from './utils/debug'

import { parse } from 'path'
import { Env } from '@secjs/env'
import { File, Folder, Path } from '@secjs/utils'
import { InternalServerException } from '@secjs/exceptions'

export class Config {
  private static configs: Map<string, any> = new Map()

  constructor() {
    const isInitialized = Config.configs.size >= 1

    if (isInitialized) {
      debugFn(
        'Reloading the Config class has no effect on the configuration files, only for environment variables, as the files have already been loaded as Singletons',
      )
    }

    Config.configs.clear()
  }

  static get<T = any>(key: string, defaultValue = undefined): T | undefined {
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

    const path = Path.pwd(configPath)

    const { files } = new Folder(path).loadSync({ withFileContent: true })

    files.forEach(file => Config.loadOnDemand(file.path, files, 0))

    return this
  }

  async load(configPath = '/config') {
    Config.loadEnvs()

    const path = Path.pwd(configPath)

    const { files } = await new Folder(path).load({ withFileContent: true })

    files.forEach(file => Config.loadOnDemand(file.path, files, 0))

    return this
  }

  static verifyPath(folderName = 'dist') {
    if (process.env.NODE_ENV === 'testing') return '/config'

    return `/${folderName}/config`
  }

  private static loadEnvs() {
    // Important to load all env files in process.env
    Env('NODE_ENV', '')

    Object.keys(process.env).forEach(key => {
      const envValue = process.env[key]

      this.configs.set(`env-${key}`, envValue)
    })
  }

  private static loadOnDemand(path: string, files: File[], callNumber = 0) {
    const { dir, name, base } = parse(path)

    if (base.includes('.map') || base.includes('.d.ts')) return

    const file = files.find(file => file.base === base)

    if (!file) return
    if (this.configs.get(name)) return

    if (callNumber > 500) {
      const content = `Your config file ${base} is using Config.get() to an other config file that is using a Config.get('${name}*'), creating a infinite recursive call.`

      throw new InternalServerException(content)
    }

    const fileContent = file.getContentSync().toString()

    if (fileContent.includes('Config.get')) {
      const matches = fileContent.match(/Config.get\(([^)]+)\)/g)

      for (let match of matches) {
        match = match.replace('Config.get', '').replace(/[(^)']/g, '')
        if (this.configs.get(`env-${match}`)) continue

        const extension = process.env.NODE_TS === 'true' ? 'ts' : 'js'
        const filePath = `${dir}/${match.split('.')[0]}.${extension}`

        this.loadOnDemand(filePath, files, callNumber + 1)
      }
    }

    debugFn(`Loading ${name} configuration file`)
    this.configs.set(name, require(`${dir}/${name}`).default)
  }
}
