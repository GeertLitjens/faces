import * as faceapi from 'face-api.js'

const MODEL_PATH =
  `${process.env.PUBLIC_URL}/static/models/face/`

const PARAMS = {
  minFaceSize: 50,
  scaleFactor: 0.709,
  maxNumScales: 10,
  scoreThresholds: [0.7, 0.7, 0.7],
}

export class FaceFinder {
  constructor(path = MODEL_PATH, params = PARAMS) {
    this.path = path
    this.params = params
  }

  async load() {
    await faceapi.loadTinyFaceDetectorModel(this.path)
  }

  async findFaces(img) {
    const input = await faceapi.toNetInput(img, false, true)
    const detections = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())

    return { input, detections }
  }

  async findAndExtractFaces(img) {
    const { input, detections } = await this.findFaces(img)
    const faces = await faceapi.extractFaces(input.inputs[0], detections)

    return { detections, faces }
  }
}
