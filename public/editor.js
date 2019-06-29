/* eslint-disable no-console */

let storageKey = 'temp'
let tileSize
let player
let rooms

function rleEncode (level) {
  const out = []
  let prev = null
  let amount = 0
  for (const val of level) {
    if (val === prev) {
      amount++
    } else {
      if (prev != null) {
        out.push(prev)
        out.push(amount)
      }
      prev = val
      amount = 1
    }
  }
  out.push(prev)
  out.push(amount)
  return out
}

function rleDecode (levelData) {
  const pairs = levelData.reduce((result, value, index, array) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2))
    }
    return result
  }, [])
  const level = []
  for (const val of pairs) {
    for (let i = 0; i < val[1]; i++) {
      level.push(val[0])
    }
  }
  return level
}

function saveLevelString (rooms) {
  const rleRooms = {}
  rleRooms.map = rleEncode(rooms.map)
/*  const dataEl = document.querySelector('.levelData')
  const dataAsString = JSON.stringify(rleRooms)
  dataEl.innerText = dataAsString */
  localStorage.setItem(storageKey, dataAsString)
}

let brush = 1

export const editor = {
  startEditor: function startEditor (canvas, scale, rooms, newTileSize, newPlayer, newStorageKey) {
    storageKey = newStorageKey
    player = newPlayer
    tileSize = newTileSize
    function getMouseXYFromEvent (e) {
      const x = event.offsetX * canvas.width / canvas.offsetWidth / scale
      const y = event.offsetY * canvas.height / canvas.offsetHeight / scale
      return { x, y }
    }

    function mouseMove (e) {
      if (!window.editMode) return
      const pos = getMouseXYFromEvent(e)
      const tile = { x: Math.floor(pos.x / tileSize), y: Math.floor(pos.y / tileSize) }
      const i = tile.x + tile.y * levelWidth
      if (e.buttons === 1) {
        rooms.map[i] = brush
        saveLevelString(rooms)
      }
      if (e.buttons === 2) {
        rooms.map[i] = 0
        saveLevelString(rooms)
      }
    }

    canvas.addEventListener('mousemove', mouseMove)
    canvas.addEventListener('mousedown', mouseMove)
    canvas.addEventListener('contextmenu', function (e) {
      if (window.editMode) e.preventDefault()
    })

    const brushes = {
      '1': 1,
      '2': 9,
      '3': 10,
      '4': 11,
      '5': 12,
      '6': 7,
      '7': 14,
      '8': 8,
    }

    window.addEventListener('keydown', function (e) {
      brush = brushes[e.key] || brush
    })
  },
  rleDecode,
  rleEncode
}
