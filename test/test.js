const assert = require('assert')
const Consumer = require('../Consumer')
const Producer = require('../Producer')
const QueueBase = require('../QueueBase')
const Redis = require('ioredis')

const topic = 'queue'

suite('queue tests', () => {
  // create redis client r with options
  let r, options = {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 6379
  }

  setup(() => {
    r = new Redis(options)
  })

  teardown(async () => {
    // make sure to tell redis to close connections or mocha won't exit
    await r.quit()
  })

  suite('basic redis tests', () => {
    test('ping redis', async () => {
      let res = await r.ping()
      assert.equal(res, "PONG")
    })

    test('retrieve messages from redis queue in fifo order', async () => {
      let key = topic
      let vals = [ "a", "b", "c" ]
      await r.rpush(key, ...vals)

      // check results received in same order sent
      vals.forEach(async v => {
        let result = await r.blpop(key, 1)
        // result is an array [ list, value ], e.g., [ "queue", "a" ]
        // console.log(`${result[1]} should equal ${v}`)
        assert.equal(result[1], v)
      })
    })

  }) // basic redis tests

  suite('producer-consumer tests', () => {

    test('new connection successfully pings', async () => {
      let conn = new QueueBase(topic)
      let res = await conn.ping()
      assert.equal(res, "PONG")
      await conn.quit()
    })

    test('using connection after quit throws an error', async () => {
      let conn = new QueueBase(topic)
      await conn.quit()
      try {
        await conn.ping()
        throw new Error('expected ping after quit to fail')
      } catch (err) {
        let expected = 'Connection is closed.'
        assert.equal(err.message, expected)
      }
    })

    test('send and receive messages using producer and consumer', async () => {
      let p = new Producer(topic)
      let c = new Consumer(topic)
      let vals = [ "a", "b", "c" ]
      vals.forEach(async v => {
        await p.send(v)
      })

      // check results received in same order sent
      vals.forEach(async v => {
        let result = await c.receive()
        assert.equal(result, v)
      })

      await p.quit()
      await c.quit()
    })

    test('can quit waiting consumer', async () => {
      let c = new Consumer(topic)

      // wait 200 ms and then close the connection
      setTimeout(() => {
        c.quit()
      }, 200)

      // blocking wait should return with null as soon as conn is closed when timer fires
      let result = await c.receive()
      assert.equal(result, null)
    })

  }) // producer-consumer tests

}) // queue tests

