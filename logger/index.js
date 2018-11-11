'use strict'

const util = require('util')
const gpio = require('rpi-gpio')
const sensor = require('ds18b20-raspi')
const mqtt = require('mqtt')

const config = require('./config')

const gpiop = gpio.promise
const readSimpleC = util.promisify(sensor.readSimpleC)

let isDoorOpen = false

gpiop
  .setup(config.doorSensorPin, gpio.DIR_IN)
  .then(() => gpiop.read(config.doorSensorPin))
  .then((value) => {
    isDoorOpen = value
    return gpiop.setup(config.doorSensorPin, gpio.DIR_IN, gpio.EDGE_BOTH)
  })
  .then(() => {
    gpio.on('change', (channel, value) => {
      if (channel === config.doorSensorPin) {
        isDoorOpen = value
      }
    })
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })

const client = mqtt.connect(config.mqttHost)

function tick() {
  readSimpleC()
    .then((temp) => {
      const date = new Date()
      const data = {
        temp,
        isDoorOpen,
        timestamp: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${
          date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
        }`,
      }
      console.log('Data: ', data)
      client.publish(config.mqttTopic, JSON.stringify(data))
    })
    .catch((error) => {
      console.log(error)
    })
}
client.on('connect', () => {
  setInterval(tick, config.interval)
})
