import '../src/utils/global'
import { Config } from '../src/Config'

describe('\n Config', () => {
  beforeAll(() => (process.env.DB_NAME = 'testing'))

  it('should be able to use global Config instance', async () => {
    await new Config().load()

    expect(Config.get('DB_NAME')).toBe('testing')
    expect(Config.get('database.dbName')).toBe('testing')
  })
})
