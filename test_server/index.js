'use strict'

const fs = require('fs')
const path = require('path')
const mqtt = require('mqtt')

const config = require('./config')

const filename = `${new Date().toISOString()}.csv`
const filePath = path.join(__dirname, config.dataPath, filename)

const headers = 'timestamp,temperature,is_door_open\n'
fs.writeFileSync(filePath, headers, { flag: 'a' })

const addToDataframe = ({ temp, isDoorOpen, timestamp }) => {
  if (typeof temp === 'undefined' || typeof isDoorOpen === 'undefined' || typeof timestamp === 'undefined') {
    throw new Error('ValidationError')
  }
  const data = `${timestamp},${temp},${isDoorOpen}\n`

  fs.writeFile(filePath, data, { flag: 'a' }, (error) => {
    if (error) {
      throw error
    } else {
      console.log(data)
    }
  })
}

const client = mqtt.connect(config.mqttHost)

client.on('connect', () => {
  client.subscribe(config.mqttTopic, (error) => {
    if (!error) {
      client.on('message', (topic, message) => {
        if (topic === config.mqttTopic) {
          try {
            addToDataframe(JSON.parse(message))
          } catch (error) {
            console.log(error)
          }
        }
      })
    }
  })
})
