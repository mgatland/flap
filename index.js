const express = require('express')
const path = require('path')

const app = express()
const server = require('http').Server(app)
server.listen(8080)
app.use('/', express.static(path.join(__dirname, 'public')))

const WebSocket = require('ws')
 
const wss = new WebSocket.Server({server})

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    console.log('on a message')
    console.log(data);
  })
  ws.send('yo')
})

app.get('/playerCount', function (req, res) {
  res.send("" + wss.clients.size)
})