import { Config } from '../src/Config'

export default {
  hello: 'world',
  circular: Config.get('circular.hello'),
  database: Config.get('database.hello'),
}
