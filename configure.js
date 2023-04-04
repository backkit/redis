const autoconf = require("@backkit/autoconf");

autoconf('redis')
.generator(self => ([
  {
    putFileOnce: self.serviceConfigMainYML,
    contentYml: self.config
  },
  {
    putFileOnce: self.serviceCodeMainJS,
    content: `module.exports = require('${self.npmModuleName}');`
  },
  {
    putFileOnce: `${self.serviceResourceDir}/.gitkeep`
  }
]))
.default(self => ({
  host: "localhost",
  port: 6379
}))
.prompt(self => ([
  {
    if: {
      fileNotFound: self.serviceConfigMainYML
    },
    type: 'input',
    name: 'host',
    message: "redis host",
    default: self.defaultConfig.host,
    validate: function(value) {
      return true;
    }
  },
  {
    if: {
      fileNotFound: self.serviceConfigMainYML
    },
    type: 'input',
    name: 'port',
    message: "redis port",
    default: self.defaultConfig.port,
    filter: function(value) {
      return ~~(value);
    },
    validate: function(value) {
      return ~~(value) > 0;
    }
  }
]))
.run()
