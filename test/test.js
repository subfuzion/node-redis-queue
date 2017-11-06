const assert = require('assert')
const config = require('config')
const redis = require('redis')
const {promisify} = require('util')

suite('queue tests', () => {
  // create redis client r with options
  let r, options = {}

  // redis funcs that we want to promisify for async/await
  let funcs = [ "set", "ping", "rpush", "blpop" ]
  // object to access promisified redis funcs
  let rasync = {}

  setup(() => {
    // load redis configuration
    let redisConfig = config.get('redis')
    options.host = redisConfig.host
    options.port = redisConfig.port

    r = redis.createClient(options)

    // promisify redis funcs
    funcs.forEach(func => {
      rasync[func] = promisify(r[func].bind(r))
    })
  })

  teardown(() => {
    // make sure to quit the redis client or mocha won't exit
    r.quit()
  })

  suite('basic redis tests', () => {
    test('ping redis', async () => {
      let res = await rasync.ping()
      assert.equal(res, "PONG")
    })

    test('retrieve messages from redis queue in fifo order', async () => {
      let key = "queue"
      let vals = [ "a", "b", "c" ]
      await rasync.rpush(key, ...vals)

      vals.forEach(async v => {
        let result = await rasync.blpop(key, 1)
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

