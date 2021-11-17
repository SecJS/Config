import { Config } from '../src/Config'
import { rm, writeFile } from 'fs/promises'

describe('\n Config', () => {
  beforeAll(() => (process.env.DB_NAME = 'testing'))

  it('should be able to get environment variables', async () => {
    await new Config().load()

    expect(Config.get('DB_NAME')).toBe('testing')
    expect(Config.get('database.dbName')).toBe('testing')
  })

  it('should be able to get variables from config files', async () => {
    await new Config().load()

    expect(Config.get('app.hello')).toBe('world')
    expect(Config.get('cache.hello')).toBe('world')
    expect(Config.get('app.database')).toBe('world')
    expect(Config.get('database.cache')).toBe('world')
  })

  it('should be able to use default values for configs that cannot be found', async () => {
    await new Config().load()

    const dbPort = Config.get<number>('DB_PORT', 3030)

    expect(dbPort).toBe(3030)
  })

  it('should clear all old configurations when creating a new Config instance', async () => {
    const oldPath = `${process.cwd()}/config/old.ts`
    await writeFile(oldPath, "export default {\n  hello: 'world',\n}\n")

    await new Config().load()

    expect(Config.get('old.hello')).toBe('world')

    await rm(oldPath)

    await new Config().load()

    expect(Config.get('old.hello')).toBe(undefined)
  })

  it('should be able to use global Config instance', async () => {
    await new Config().load()

    expect(Config.get('DB_NAME')).toBe('testing')
    expect(Config.get('database.dbName')).toBe('testing')
  })

  it('should throw an error when finds a recursive Config.get in config files', async () => {
    const circularPath = `${process.cwd()}/config/circular.ts`

    await writeFile(
      circularPath,
      "import { Config } from '../src/Config'\n\nexport default {\n  hello: 'world',\n  app: Config.get('app.hello'),\n}\n",
    )

    try {
      await new Config().load()
    } catch (error) {
      expect(error.isSecJsException).toBe(true)
      expect(error.name).toBe('InternalServerException')
      expect(error.content).toBe(
        "Your config file circular.ts is using Config.get() to an other config file that is using a Config.get('circular*'), creating a infinite recursive call.",
      )
    } finally {
      await rm(circularPath)
    }
  })
})
