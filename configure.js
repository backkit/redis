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
  url: "redis://localhost:6379"
}))
.prompt(self => ([
  {
    if: {
      fileNotFound: self.serviceConfigMainYML
    },
    type: 'input',
    name: 'url',
    message: "redis url string",
    default: self.defaultConfig.url,
    validate: function(value) {
      return true;
    }
  }
]))
.run()
