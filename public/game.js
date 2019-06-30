"use strict"

window.editMode = true

import { editor } from './editor.js'

const storageKey = 'github.com/mgatland/flap/map'

const player = {
  pos: { x: 16, y: 44 },
  vel: { x: 0, y: 0 },
  facingLeft: false
}

const camera = {
  pos: {x: player.pos.x, y: player.pos.y}
}

const maxXVel = 2
const xAccel = 0.1
const xDecel = 0.05

const scale = 4
const tileSize = 16
let canvas
let ctx
let spriteImage

let savedMap = localStorage.getItem(storageKey)
let world = savedMap ? JSON.parse(savedMap) : {}
if (savedMap) {
  console.warn('Loading map from local storage. This is only for development use.')
  console.log(savedMap)
} else {
  world =
  {  "width": 50,  "height": 50,  "map": [null,0,1,51,0,48,1,2,0,48,1,2,0,48,1,2,0,10,7,1,0,21,6,1,0,15,1,2,0,32,6,1,0,15,1,2,0,4,7,1,0,24,6,7,0,12,1,2,0,48,1,2,0,19,7,1,0,28,1,2,0,48,1,2,0,41,6,4,0,3,1,2,0,48,1,2,0,6,6,6,0,36,1,2,0,47,6,1,1,2,0,41,7,4,0,3,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,23,6,2,0,23,1,2,0,24,6,2,0,22,1,2,0,25,6,2,0,21,1,2,0,26,6,2,0,20,1,2,0,27,6,2,0,19,1,2,0,28,6,2,0,18,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,13,7,8,0,14,6,1,0,12,1,2,0,13,7,1,0,6,7,1,0,15,6,1,0,11,1,2,0,20,7,1,0,16,6,1,0,10,1,2,0,20,7,1,0,17,6,1,0,9,1,2,0,20,7,1,0,18,6,1,0,8,1,2,0,13,7,1,0,6,7,1,0,12,6,5,0,10,1,2,0,13,7,1,0,3,7,1,0,2,7,1,0,27,1,2,0,13,7,1,0,6,7,1,0,27,1,2,0,13,7,8,0,27,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,6,2,0,46,1,2,0,48,1,51,0,2  ]}
}
world.map = editor.rleDecode(world.map)


function start () {
  canvas = document.querySelector('canvas')
  ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false
  const defaultFont = "16px 'uni 05_64'"
  const titleFont = "32px 'uni 05_64'"
  ctx.font = defaultFont
  ctx.fillStyle = 'black'
  ctx.baseLine = 'bottom'
  spriteImage = new Image()
  spriteImage.src = 'sprites.png'
  spriteImage.addEventListener('load', loaded, false)
}

function loaded () {
  editor.startEditor(canvas, scale, world, tileSize, player, storageKey, camera)
  tick()
}

function tick () {
  updatePlayer()
  keys.flap = false // special case
  draw()
  requestAnimationFrame(tick)
}


function draw () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawLevel()
  drawPlayer()
}

function drawPlayer() {
  let sprite
  if (player.flapAnim < 1) {
    sprite = 2
  } else if (player.flapAnim < 4) {
    sprite = 3
  } else {
    sprite = 4
  }
  drawSprite(sprite, player.pos.x, player.pos.y, player.facingLeft)
}

function drawSprite (index, x, y, flipped = false) {
  const width = tileSize
  const height = tileSize
  x = Math.floor((x - camera.pos.x) * scale)
  y = Math.floor((y - camera.pos.y) * scale)
  x += Math.floor(canvas.width / 2)
  y += Math.floor(canvas.height / 2)
  ctx.translate(x, y)
  if (flipped) ctx.scale(-1, 1)

  const sX = (index % 16) * width
  const sY = Math.floor(index / 16) * height
  ctx.drawImage(spriteImage,
    sX, sY,
    width, height,
    -width / 2 * scale, -height / 2 * scale,
    width * scale, height * scale)
  if (flipped) ctx.scale(-1, 1)
  ctx.translate(-x, -y)
}

function drawLevel () {
  const level = world.map
  const center = {x: camera.pos.x / tileSize, y: camera.pos.y / tileSize}
  const halfWidth = canvas.width / 2 / scale / tileSize
  const halfHeight = canvas.height / 2 / scale / tileSize
  const minY = Math.floor(center.y - halfHeight)
  const maxY = Math.floor(center.y + halfHeight + 1)
  const minX = Math.floor(center.x - halfWidth)
  const maxX = Math.floor(center.x + halfWidth + 1)
  for (let tY = minY; tY < maxY; tY++) {
    for (let tX = minX; tX < maxX; tX++) {
      const i = tX + tY * world.width
      const x = (i % world.width) + 0.5
      const y = Math.floor(i / world.width) + 0.5
      const sprite = level[i]
      drawSprite(sprite, x * tileSize, y * tileSize)
    }
  }
}

function updatePlayer () {
  if (keys.right && player.vel.x < maxXVel) player.vel.x += xAccel
  else if (keys.left && player.vel.x > -maxXVel) player.vel.x -= xAccel
  else if (!keys.left && player.vel.x < 0 && isGrounded(player)) player.vel.x += Math.min(-player.vel.x, xDecel)
  else if (!keys.right && player.vel.x > 0 && isGrounded(player)) player.vel.x -= Math.min(player.vel.x, xDecel)

  if (keys.left) player.facingLeft = true
  if (keys.right) player.facingLeft = false

  // check collisions x
  player.pos.x += player.vel.x

  const collidingTile = getCollidingTiles(player.pos)
  if (collidingTile !== null) {
    const clearTileIndex = getIndexFromPixels(collidingTile.x, collidingTile.y) +
      (player.vel.x < 0 ? 1 : -1) // move player one tile left or right
    const { x: clearX } = getPixelsFromIndex(clearTileIndex)
    player.pos.x = clearX + tileSize / 2
    player.vel.x = 0
  }

  if (!keys.jump) player.flapAnim++

  if (keys.flap) {
    let flapSpeed = -1
    player.vel.y = Math.min(player.vel.y, 0)
    player.vel.y += flapSpeed
    player.flapAnim = 0
  }
  player.vel.y += 0.04

  // check collisions y
  player.pos.y += player.vel.y
  

  const collidingTileY = getCollidingTiles(player.pos)
  if (collidingTileY !== null) {
    const clearTileIndex = getIndexFromPixels(collidingTileY.x, collidingTileY.y) +
      (player.vel.y < 0 ? world.width : -world.width) // move player one tile up or down
    const { y: clearY } = getPixelsFromIndex(clearTileIndex)
    player.pos.y = clearY + tileSize / 2
    player.vel.y = 0
  }

  camera.pos.x = player.pos.x
  camera.pos.y = player.pos.y
}

export const game = {
  start: start
}

// flap is a special case, only actiates on hit
const keys = { up: false, left: false, right: false, down: false, cheat: false, jump: false, flap: false }

function switchKey (key, state) {

  switch (key) {
    case 'ArrowLeft':
    case 'a':
      keys.left = state
      break
    case 'ArrowRight':
    case 'd':
      keys.right = state
      break
    case 'ArrowUp':
    case 'w':
      keys.up = state
      break
    case 'ArrowDown':
    case 's':
      keys.down = state
      break
    case ' ':
      //we check keys.jump to prevent keyboard repeat)
      if (state === true && !keys.jump) keys.flap = state
      keys.jump = state
    case 'q':
      keys.cheat = state
      break
  }

  // hack for cheatmode
  if (state === false && keys.cheat && key === 'l') {
    player.cheatMode = !player.cheatMode
  }
}

window.addEventListener('keydown', function (e) {
  switchKey(e.key, true)
})

window.addEventListener('keyup', function (e) {
  switchKey(e.key, false)
})

function getIndexFromPixels (x, y) {
  if (x < 0 || y < 0 || x >= world.width * tileSize || y >= world.height * tileSize) return -1
  return Math.floor((y / tileSize)) * world.width + Math.floor((x / tileSize))
}

function getPixelsFromIndex (i) {
  return { x: (i % world.width) * tileSize, y: Math.floor(i / world.width) * tileSize }
}

function isGrounded (ent) {
  return !!getCollidingTiles({ x: ent.pos.x, y: ent.pos.y + 0.1 })
}

function getCollidingTiles (pos) {
  const { x, y } = pos
  const halfTile = tileSize / 2
  const tilesToCheck = [
    [ -halfTile, -halfTile, 'topLeft' ],
    [ halfTile - 0.001, -halfTile, 'topRight' ],
    [ -halfTile, halfTile - 0.001, 'bottomLeft' ],
    [ halfTile - 0.001, halfTile - 0.001, 'bottomRight' ]
  ]
  for (const [xOffset, yOffset] of tilesToCheck) {
    const tileX = Math.floor(x + xOffset)
    const tileY = Math.floor(y + yOffset)
    const tileIndex = getIndexFromPixels(tileX, tileY)
    const tile = world.map[tileIndex]
    if (tile >= 1) {
      return { x: tileX, y: tileY }
    }
  }
  return null
}