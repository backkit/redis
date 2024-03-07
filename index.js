const redis = require("redis");

class Redis {

  constructor({config, logger}) {
    this.config = config;
    this.logger = logger;
    this.clients = [];
  }

  /**
   * Create new client
   *
   * @return {Promise}
   */
  async makeClient(selectedDb, connectNow) {
    const i = this.clients.length+1;
    const logger = this.logger;
    const redisconf = this.config.get('redis');
    let params = {};
    if (redisconf.url) {
      params.url = redisconf.url;
    } else {
      params.socket = {
        host: redisconf.host || '127.0.0.1',
        port: redisconf.port || 6379
      };
      if (redisconf.user) params.username = redisconf.user;
      if (redisconf.pass) params.password = redisconf.pass;
      if (redisconf.tls) params.tls = (redisconf.tls === true);
    }
    params.database = selectedDb || 0;
    
    const client = redis.createClient(params);

    client.on("connect", (err) => {
      logger.info(`Redis client #${i} connected !`);
    });
    
    client.on("ready", (err) => {
      logger.info(`Redis client #${i} ready !`);
    });
    
    client.on("end", (err) => {
      logger.info(`Redis client #${i}/${this.clients.length} ended !`);
    });
    
    client.on("reconnecting", (err) => {
      logger.info(`Redis client #${i}/${this.clients.length} reconnecting...`);
    });
    
    client.on("error", (err) => {
      logger.error(`Redis client #${i}/${this.clients.length} error: ${err.message}`);
    });

    this.clients.push(client);

    if (typeof(connectNow) === 'undefined' || connectNow === true) {
      await client.connect();
    }
    return client;
  }

  /**
   * Properly disconnect all clients
   */
  async disposeAllClients() {
    const logger = this.logger;
    let i = 1;

    for await (const cli of this.clients) {
      try {
        await cli.disconnect();
      } catch (err) {
        logger.error(`Redis disposeAllClients error: ${err.message}`);
      }
      i++;
    }
    logger.info(`Redis disposeAllClients: all ${this.clients.length} clients closed`);
  }

  /**
   * Shortcut to set store an object at $key 
   */
  async setObject(key, val, selectedDb) {
    selectedDb = selectedDb || 0;
    try {
      const cli = await this.makeClient(selectedDb);
      const jval = JSON.stringify(val);
      await cli.set(key, jval);
      await cli.disconnect();
    } catch (err) {
      this.logger.error(`Redis putJson error: ${err.message}`);
    }
  }

  /**
   * Shortcut to read value at $key
   * returns parsed json or null
   */
  async getObject(key, selectedDb) {
    selectedDb = selectedDb || 0;
    try {
      const cli = await this.makeClient(selectedDb);
      const val = await cli.get(key);
      const ret = JSON.parse(val);
      await cli.disconnect();
      return ret;
    } catch (err) {
      this.logger.error(`Redis getJson error: ${err.message}`);
      return null;
    }
  }

}

module.exports = Redis;