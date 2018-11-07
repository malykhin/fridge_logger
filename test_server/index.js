'use strict'

const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const config = require('./config')

const app = express()
const jsonParser = bodyParser.json()

const filename = `${new Date().toISOString()}.csv`
const filePath = path.join(__dirname, config.dataPath, filename)

const headers = 'timestamp, temperature, is_door_open,\n'
fs.writeFileSync(filePath, headers, { flag: 'a' })

app.post('/', jsonParser, (req, res) => {
  const { temp, isDoorOpen, timestamp } = req.body

  if (typeof temp === 'undefined' || typeof isDoorOpen === 'undefined' || typeof timestamp === 'undefined') {
    res.status(400).send({ status: 'error', error: 'body is not valid' })
  }
  const data = `${timestamp}, ${temp}, ${isDoorOpen},\n`

  fs.writeFileSync(filePath, data, { flag: 'a' }, (error) => {
    if (error) {
      console.log(error)
      res.status(500).send({ status: 'error' })
    } else {
      res.status(200).send({ status: 'ok' })
    }
  })
})

app.listen(config.port, () => console.log(`app is listening on port ${config.port}`))
