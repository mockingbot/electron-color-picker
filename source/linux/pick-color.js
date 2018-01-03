const getSystemEndianness = () => {
  try {
    const buffer = new ArrayBuffer(4)
    const viewUint8 = new Uint8Array(buffer)
    const viewUint32 = new Uint32Array(buffer)
    viewUint8[ 0 ] = 0xa1
    viewUint8[ 1 ] = 0xb2
    viewUint8[ 2 ] = 0xc3
    viewUint8[ 3 ] = 0xd4
    if (viewUint32[ 0 ] === 0xd4c3b2a1) return 'little'
    if (viewUint32[ 0 ] === 0xa1b2c3d4) return 'big'
  } catch (error) { console.error('[getSystemEndianness]', error) }
  return 'unknown'
}

let BUFFER_CANVAS
let BUFFER_CANVAS_CONTEXT
const getQuickCanvas = () => (BUFFER_CANVAS = BUFFER_CANVAS || document.createElement('canvas'))
const getQuickContext = () => (BUFFER_CANVAS_CONTEXT = BUFFER_CANVAS_CONTEXT || getQuickCanvas().getContext('2d'))

const getUint32HexColor = getSystemEndianness() === 'little'
  ? (R, G, B, A) => (R << 0) + (G << 8) + (B << 16) + (A << 24) // little endian
  : (R, G, B, A) => (R << 24) + (G << 16) + (B << 8) + (A << 0) // big endian

const toHex = (value) => value.length > 1 ? value : `0${value}`
const getCanvasImageDataPixelColor = (imageData, x, y) => {
  const index = x + y * imageData.width
  const index4 = index * 4
  const data = imageData.data
  const R = data[ index4 ].toString(16)
  const G = data[ index4 + 1 ].toString(16)
  const B = data[ index4 + 2 ].toString(16)
  return `#${toHex(R)}${toHex(G)}${toHex(B)}`.toUpperCase()
}

const scaleCanvasImageData = (imageData, scaleX, scaleY = scaleX) => {
  const sourceImageData = imageData
  const sourcePixelWidth = sourceImageData.width
  const sourcePixelArray = new Uint32Array(sourceImageData.data.buffer)
  const targetImageData = getQuickContext().getImageData(0, 0, sourcePixelWidth * scaleX, sourceImageData.height * scaleY)
  const targetPixelWidth = targetImageData.width
  const targetPixelArray = new Uint32Array(targetImageData.data.buffer)
  const targetPixelCount = targetPixelWidth * targetImageData.height
  for (let targetPixelIndex = 0; targetPixelIndex < targetPixelCount; targetPixelIndex++) {
    const targetX = targetPixelIndex % targetPixelWidth
    const targetY = Math.floor(targetPixelIndex / targetPixelWidth)
    const sourceX = Math.floor(targetX / scaleX)
    const sourceY = Math.floor(targetY / scaleY)
    const sourcePixelIndex = (sourceX + sourceY * sourcePixelWidth)
    targetPixelArray[ targetPixelIndex ] = sourcePixelArray[ sourcePixelIndex ]
  }
  return targetImageData
}

const loadImageDataUrlAsImageElement = ({ imageDataUrl }) => new Promise((resolve, reject) => {
  const imageElement = document.createElement('img')
  imageElement.onerror = reject
  imageElement.onload = () => resolve(imageElement)
  imageElement.src = imageDataUrl
})

const getCheckBoxBorder = (boxX, boxY, size) => {
  const left = boxX - size * 0.5
  const right = boxX + size * 0.5
  const top = boxY - size * 0.5
  const bottom = boxY + size * 0.5
  return (x, y) => (
    (x === left && y >= top && y <= bottom) || (x === right && y >= top && y <= bottom) ||
    (y === top && x >= left && x <= right) || (y === bottom && x >= left && x <= right)
  )
}

// ==============================================================================

const colorOpacity = getUint32HexColor(0, 0, 0, 0)
const colorBorder = getUint32HexColor(244, 244, 244, 150)
const colorBorderDark = getUint32HexColor(32, 32, 32, 255)
const colorBorderLight = getUint32HexColor(255, 255, 255, 255)

const createScaledGridMask = ({ ZOOM, GRID_COUNT }) => {
  const gridSize = GRID_COUNT * ZOOM
  const isBoxBorderInner = getCheckBoxBorder(gridSize >> 1, gridSize >> 1, ZOOM)
  const isBoxBorderOuter = getCheckBoxBorder(gridSize >> 1, gridSize >> 1, ZOOM + 2)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = gridSize
  const bufferImageData = canvas.getContext('2d').getImageData(0, 0, gridSize, gridSize)
  const pixelArray = new Uint32Array(bufferImageData.data.buffer)
  for (let index = 0, indexMax = gridSize * gridSize; index < indexMax; index++) {
    const x = index % gridSize
    const y = Math.floor(index / gridSize)
    pixelArray[ index ] = (x % ZOOM === 0 || y % ZOOM === 0)
      ? colorBorder
      : colorOpacity
    if (isBoxBorderInner(x, y)) pixelArray[ index ] = colorBorderDark
    if (isBoxBorderOuter(x, y)) pixelArray[ index ] = colorBorderLight
  }
  canvas.getContext('2d').putImageData(bufferImageData, 0, 0)
  return canvas
}

// a circular pixel grid follow your cursor with color tag on it
const createPickerCanvasUpdater = ({ canvas, ZOOM, GRID_COUNT }) => {
  return (event) => {
    const rect = canvas.getBoundingClientRect()
    const canvasPosition = {
      x: (event.clientX - rect.left) / rect.width * canvas.width,
      y: (event.clientY - rect.top) / rect.height * canvas.height
    }

    const startX = Math.round(canvasPosition.x - GRID_COUNT / 2)
    const startY = Math.round(canvasPosition.y - GRID_COUNT / 2)
    const imageData = canvas.getContext('2d').getImageData(startX, startY, GRID_COUNT, GRID_COUNT)

    const colorHex = getCanvasImageDataPixelColor(imageData, GRID_COUNT >> 1, GRID_COUNT >> 1)
    const scaledImageData = scaleCanvasImageData(imageData, ZOOM, ZOOM)
    return { colorHex, scaledImageData }
  }
}

const pickColor = ({ sourceCanvas, pickerCanvasContext, pickerDiv, colorPre, ZOOM, GRID_COUNT }) => new Promise((resolve) => {
  const scaledGridMaskCanvas = createScaledGridMask({ ZOOM, GRID_COUNT })
  const pickerCanvasUpdater = createPickerCanvasUpdater({ canvas: sourceCanvas, ZOOM, GRID_COUNT })

  const update = (event) => {
    const { colorHex, scaledImageData } = pickerCanvasUpdater(event)
    // __DEV__ && console.log('[update] scaledImageData', scaledImageData.width, scaledImageData.height)
    pickerCanvasContext.putImageData(scaledImageData, 0, 0)
    pickerCanvasContext.drawImage(scaledGridMaskCanvas, 0, 0)
    const pickerRect = pickerDiv.getBoundingClientRect()
    pickerDiv.style.visibility = 'visible'
    pickerDiv.style.transform = `translate3d(${Math.round(event.clientX - pickerRect.width / 2)}px, ${Math.round(event.clientY - pickerRect.height / 2)}px, 0)`
    colorPre.innerHTML = colorHex
    prevColorHex = colorHex
    // __DEV__ && console.log('update', { colorHex })
  }

  let pendingEvent = null
  const debouncedUpdate = (event) => {
    pendingEvent || window.requestAnimationFrame(() => {
      update(pendingEvent)
      pendingEvent = null
    })
    pendingEvent = event
  }

  let prevColorHex
  sourceCanvas.addEventListener('mousemove', debouncedUpdate)
  sourceCanvas.addEventListener('click', () => {
    sourceCanvas.removeEventListener('mousemove', debouncedUpdate)
    resolve(prevColorHex)
  })
})

// ==============================================================================

window.PICK_COLOR = async ({ IMAGE_DATA_URL, ZOOM = 10, GRID_COUNT = 17 }) => {
  if (!Number.isInteger(ZOOM)) throw new Error(`[LOAD_SCREENSHOT] invalid integer ZOOM: ${ZOOM}`)
  if (!Number.isInteger(GRID_COUNT) || GRID_COUNT % 2 !== 1) throw new Error(`[LOAD_SCREENSHOT] invalid odd integer GRID_COUNT: ${GRID_COUNT}`)

  __DEV__ && console.log('[PICK_COLOR] get IMAGE_DATA_URL:', IMAGE_DATA_URL.length)
  const sourceCanvas = document.getElementById('canvas-source')
  const imageElement = await loadImageDataUrlAsImageElement({ imageDataUrl: IMAGE_DATA_URL })
  sourceCanvas.width = imageElement.width
  sourceCanvas.height = imageElement.height
  sourceCanvas.getContext('2d').drawImage(imageElement, 0, 0)

  const pickerDiv = document.getElementById('div-picker')
  const colorPre = document.getElementById('pre-color')
  const pickerCanvas = document.getElementById('canvas-picker')
  const pickerCanvasContext = pickerCanvas.getContext('2d')
  pickerCanvas.width = pickerCanvas.height = ZOOM * GRID_COUNT

  const colorHex = await pickColor({ sourceCanvas, pickerCanvasContext, pickerDiv, colorPre, ZOOM, GRID_COUNT })
  __DEV__ && console.log('[PICK_COLOR] get colorHex:', { colorHex })
  return colorHex
}

__DEV__ && window.addEventListener('load', async () => {
  const blobToDataUrl = (blob) => new Promise((resolve) => {
    const reader = new window.FileReader()
    reader.addEventListener('load', () => resolve(reader.result), false)
    reader.readAsDataURL(blob)
  })
  const response = await window.fetch('https://en.wikipedia.org/static/images/project-logos/enwiki.png', { mode: 'cors' })
  const imageBlob = await response.blob()
  const imageDataUrl = await blobToDataUrl(imageBlob)
  const result = await window.PICK_COLOR({ IMAGE_DATA_URL: imageDataUrl })
  console.log('[TEST]', { result })
})
