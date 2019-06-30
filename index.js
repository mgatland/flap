const express = require('express')
const path = require('path')

const app = express()
const server = require('http').Server(app)
server.listen(process.env.PORT || 8080)
app.use('/', express.static(path.join(__dirname, 'public')))

const WebSocket = require('ws')

const players = {}
let nextId = 0

const wss = new WebSocket.Server({server})

wss.on('connection', function connection(ws) {
  const id = nextId++
  ws.on('message', function incoming(data) {
    players[""+id] = data
  })
})

app.get('/playerCount', function (req, res) {
  res.send("" + wss.clients.size)
})

function netUpdate() {
  //console.log(JSON.stringify(players))
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify(players))
 });
}

setInterval(netUpdate, 32)