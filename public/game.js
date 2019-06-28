"use strict"

const player = {
  pos: { x: 16, y: 44 },
  vel: { x: 0, y: 0 },
  facingLeft: false
}

const maxXVel = 2
const xAccel = 0.1
const xDecel = 0.05

const scale = 8
let canvas
let ctx
let spriteImage

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
  tick()
}

function tick () {
  updatePlayer()
  draw()
  requestAnimationFrame(tick)
}


function draw () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  //drawLevel()
  drawPlayer()
}

function drawPlayer() {
  drawSprite(2, player.pos.x, player.pos.y, player.facingLeft)
}

function drawSprite (index, x, y, flipped = false) {
  const width = 8
  const height = 8
  x = Math.floor(x * scale)
  y = Math.floor(y * scale)
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

/*function drawLevel () {
  for (let i = 0; i < level.length; i++) {
    const x = (i % levelWidth) + 0.5
    const y = Math.floor(i / levelWidth) + 0.5
    const sprite = level[i]
    if (sprite === partyPlaceholder && !player.cheatMode) {
      partyPos.push({ x, y })
    } else {
      drawSprite(sprite, x * tileSize, y * tileSize)
    }
  }
}*/

function updatePlayer () {
    if (keys.right && player.vel.x < maxXVel) player.vel.x += xAccel
    else if (keys.left && player.vel.x > -maxXVel) player.vel.x -= xAccel
    else if (!keys.left && player.vel.x < 0 && isGrounded(player)) player.vel.x += Math.min(-player.vel.x, xDecel)
    else if (!keys.right && player.vel.x > 0 && isGrounded(player)) player.vel.x -= Math.min(player.vel.x, xDecel)

    if (keys.left) player.facingLeft = true
    if (keys.right) player.facingLeft = false

    // check collisions x
    player.pos.x += player.vel.x

    /*const collidingTile = getCollidingTiles(player.pos)
    if (collidingTile !== null) {
      const clearTileIndex = getIndexFromPixels(collidingTile.x, collidingTile.y) +
        (player.vel.x < 0 ? 1 : -1) // move player one tile left or right
      const { x: clearX } = getPixelsFromIndex(clearTileIndex)
      player.pos.x = clearX + tileSize / 2
      player.vel.x = 0
    }*/

    if (keys.up) {
      player.vel.y = -0.4 // If we ever add slopes, we'd want to preserve vertical speed here sometimes.
      player.vel.y -= Math.abs(player.vel.x / 4)
    }
    player.vel.y += 0.1

    // check collisions y
    player.pos.y += player.vel.y
    /*

    const collidingTileY = getCollidingTiles(player.pos)
    if (collidingTileY !== null) {
      const clearTileIndex = getIndexFromPixels(collidingTileY.x, collidingTileY.y) +
        (player.vel.y < 0 ? levelWidth : -levelWidth) // move player one tile up or down
      const { y: clearY } = getPixelsFromIndex(clearTileIndex)
      player.pos.y = clearY + tileSize / 2
      player.vel.y = 0
    }
  }*/
}

export const game = {
  start: start
}

const keys = { up: false, left: false, right: false, down: false, cheat: false }

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
    case ' ':
      keys.up = state
      break
    case 'ArrowDown':
    case 's':
      keys.down = state
      break
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

function isGrounded () {
  return false
}