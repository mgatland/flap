/* eslint-disable no-console */
'use strict'

import { game } from './game.js'

function showMessage (m) {
  console.log(m)
}

async function getPlayerCount () {
  return await fetch('/playerCount').then(r => r.json())
}

async function load () {
  document.querySelector("#playerCount").textContent = await getPlayerCount()
}

let ws

document.querySelector('button').addEventListener('click', function (e) {
  if (ws) {
    ws.onerror = ws.onopen = ws.onclose = null
    ws.close()
  }

  ws = new WebSocket(`ws://${location.host}`)
  ws.onerror = function() {
    showMessage('WebSocket error')
  }
  ws.onopen = function() {
    showMessage('WebSocket connection established')
    document.querySelector(".startup").classList.add('hidden')
    document.querySelector(".gameCanvas").classList.remove('hidden')
    game.start()
  }
  ws.onclose = function() {
    showMessage('WebSocket connection closed')
  }
  ws.onmessage = function (msg) {
    console.log(msg.data)
  }
})

load()