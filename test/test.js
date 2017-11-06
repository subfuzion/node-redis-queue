const assert = require('assert')
const config = require('config')
const Redis = require('ioredis')

suite('queue tests', () => {
  // create redis client r with options
  let r, options = {}

  setup(() => {
    // load redis configuration
    let redisConfig = config.get('redis')
    options.host = redisConfig.host
    options.port = redisConfig.port

    r = new Redis(options)
  })

  teardown(() => {
    // make sure to tell redis to close connections or mocha won't exit
    r.quit()
  })

  suite('basic redis tests', () => {
    test('ping redis', async () => {
      let res = await r.ping()
      assert.equal(res, "PONG")
    })

    test('retrieve messages from redis queue in fifo order', async () => {
      let key = "queue"
      let vals = [ "a", "b", "c" ]
      await r.rpush(key, ...vals)

      vals.forEach(async v => {
        let result = await r.blpop(key, 1)
        // result is an array [ list, value ], e.g., [ "queue","a" ]
        // console.log(`${result[1]} should equal ${v}`)
        assert.equal(result[1], v)
      })
    })

  }) // basic redis tests

  suite('producer-consumer tests', () => {

    test('send and receive messages using producer and consumer', async () => {

    })

  }) // producer-consumer tests

}) // queue tests

