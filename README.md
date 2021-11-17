# Config ⚙️

> Cache and handle config files for Node.js

[![GitHub followers](https://img.shields.io/github/followers/jlenon7.svg?style=social&label=Follow&maxAge=2592000)](https://github.com/jlenon7?tab=followers)
[![GitHub stars](https://img.shields.io/github/stars/secjs/config.svg?style=social&label=Star&maxAge=2592000)](https://github.com/secjs/config/stargazers/)

<p>
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/secjs/config?style=for-the-badge&logo=appveyor">

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/secjs/config?style=for-the-badge&logo=appveyor">

  <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen?style=for-the-badge&logo=appveyor">

  <a href="https://www.buymeacoffee.com/secjs" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>

The intention behind this repository is to always maintain a `Config` package that will handle all the config files inside config folder.

<img src=".github/config.png" width="200px" align="right" hspace="30px" vspace="100px">

## Installation

> To use the high potential from this package you need to install first this other packages from SecJS,
> it keeps as dev dependency because one day `@secjs/core` will install everything once.

```bash
npm install @secjs/contracts @secjs/exceptions
```

> Then you can install the package using:

```bash
npm install @secjs/config
```

## Usage

### Files template

> First you need to create the configuration files in the config folder on project root path. 
> Is extremely important to use export default in these configurations. 
> You can check [here](https://github.com/SecJS/Config/tree/main/config) more templates.

```ts
// ./config/app.ts
export default {
  hello: 'world'
}
```

### Config

> You can use Config class as a global importing just one time the global file

```ts
import '@secjs/config/src/utils/global'

;(async () => {
  await new Config().load()
  
  Config.get('app.hello')
})()
```

> Use Config class to load and get values from config files and environment variables.

```ts
import { Config } from '@secjs/config'

;(async () => {
  process.env.DB_HOST = '127.0.0.1'
  // First of all you need the load all the configurations
  await new Config().load()
})()

// Now Config is ready to use
console.log(Config.get('app')) // { hello: 'world' }
console.log(Config.get('app.hello')) // world

// You can use Config to get environment variables too but we recommend using @secjs/env
console.log(Config.get('DB_HOST')) // 127.0.0.1

// You can use a defaultValue, if config does not exist, defaultValue will be returned
console.log(Config.get('app.dbPort', 3030)) // 3030
```

### Using Config.get inside configuration files

> You can use Config.get appointing to other configurations files inside configuration files, but it can't be circular, if circular is found, 
> an exception will be thrown on load.

> 🛑 BAD! 🛑

```ts
// ./config/app.ts
export default {
  hello: Config.get('database.hello')
}

// ./config/database.ts
export default {
  hello: Config.get('app.hello')
}
```

> ✅ GOOD! ✅

```ts
// ./config/app.ts
export default {
  hello: Config.get('database.hello')
}

// ./config/database.ts
export default {
  hello: Config.get('cache.hello'),
  environmentVariable: Config.get('DB_HOST')
}

// ./config/cache.ts
export default {
  hello: 'hello',
}
```

### What happened here ?

> Config understands that app.ts needs database.ts to work, but database.ts needs cache.ts to work too. 
> So Config will start loading cache.ts configuration file first, because this file is at the top of the dependency chain.

---

## License

Made with 🖤 by [jlenon7](https://github.com/jlenon7) :wave:
