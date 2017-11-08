const common = require('./common')
const R = require('rambda')
const Redis = require('ioredis')

class QueueBase {
  /**
   * Create a new instance with a connection to the queue.
   * @param {string} topic The queue topic to associate with this instance.
   * @param {object} [config] An object with host and port values.
   */
  constructor(topic, config) {
    this._topic = topic
    this._config = config || common.DefaultConfig
    this._client = new Redis(this.config)
    this._isClosed = false
  }

  /**
   * Returns false until the quit method has been called, then true.
   * @return {boolean}
   */
  get isClosed() {
    return this._isClosed
  }

  /**
   * Get a copy of the config object.
   * @return {{} & (*|DefaultConfig)}
   */
  get config() {
    return R.merge({}, this._config)
  }

  /**
   * Get access to the internal queue client.
   * @return {*}
   */
  get client() {
    return this._client
  }

  /**
   * Get the topic associated with this instance.
   * @return {string}
   */
  get topic() {
    return this_topic
  }

  /**
   * Attempt to close client and server ends of the connection gracefully.
   * Calling any other methods will throw 'Connection is closed' errors after this.
   * @return {Promise<*>}
   */
  async quit() {
    this._isClosed = true
    return await this._client.quit()
  }

  /**
   * Ping the queue to confirm the connection works.
   * @return {Promise<string>} Returns 'PONG' if successful.
   */
  async ping() {
    return await this._client.ping()
  }
}

module.exports = QueueBase
