import { Config } from '../src/Config'

export default {
  hello: 'world',
  dbName: Config.get('DB_NAME'),
  cache: Config.get('cache.hello'),
}
