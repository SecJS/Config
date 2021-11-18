import '../src/utils/global'

describe('\n Config', () => {
  it('should be able to use global Config instance', async () => {
    expect(Config.get('app.hello')).toBe('world')
  })

  it('should be able to reload environment variables from Config class but never the config files', async () => {
    process.env.DB_NAME = 'testing'

    new Config().loadSync()

    expect(Config.get('DB_NAME')).toBe('testing')
    expect(Config.get('database.dbName')).toBe(undefined)
  })
})
