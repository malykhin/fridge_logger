'use strict'

require('isomorphic-fetch')
const util = require('util')
const gpio = require('rpi-gpio')
const sensor = require('ds18b20-raspi')

const config = require('./config')

const gpiop = gpio.promise
const readSimpleC = util.promisify(sensor.readSimpleC)

let isDoorOpen = false

gpiop
  .setup(config.DOOR_SENSOR_PIN, gpio.DIR_IN)
  .then(() => gpiop.read(config.DOOR_SENSOR_PIN))
  .then((value) => {
    isDoorOpen = value
    return gpiop.setup(config.DOOR_SENSOR_PIN, gpio.DIR_IN, gpio.EDGE_BOTH)
  })
  .then(() => {
    gpio.on('change', (channel, value) => {
      if (channel === config.DOOR_SENSOR_PIN) {
        isDoorOpen = value
      }
    })
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })

function tick() {
  readSimpleC()
    .then((temp) => {
      const data = {
        temp,
        isDoorOpen,
        timestamp: new Date().toISOString(),
      }
      console.log('Data: ', data)
      const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      }
      return fetch(config.REPORT_URL, options)
    })
    .then((response) => {
      if (response.status >= 400) {
        console.log('Bad response')
      }
      return response.json()
    })
    .then((response) => {
      console.log('Response: ', response)
    })
    .catch((error) => {
      console.log(error)
    })
}

setInterval(tick, config.INTERVAL)
