import { prepImg, } from './img'
import * as tf from '@tensorflow/tfjs'

class Model {
  constructor({ path, imageSize, classes, isGrayscale = false }) {
    this.path = path
    this.imageSize = imageSize
    this.classes = classes
    this.isGrayscale = isGrayscale
  }

  async load() {
    this.model = await tf.loadModel(this.path)
  }

  async imgToInputs(img) {
    // Convert to tensor & resize if necessary
    let norm = await prepImg(img, this.imageSize)

    // Reshape to a single-element batch so we can pass it to predict.
    return norm.reshape([1, ...norm.shape])
  }

  async classify(imgs) {
    let classes = []
    for(let i = 0; i < imgs.length; ++i) {
      let img_classes = await this.classifySingleImage(imgs[i])
      classes.push(img_classes)
    }
    return classes
  }

  async classifySingleImage(img) {
    let inputs = await this.imgToInputs(img)
    let logits = tf.tidy(() => {return this.model.predict(inputs)})
    inputs.dispose()
    let classes = await this.getTopClass(logits)
    logits.dispose()
    inputs = null
    logits = null
    return classes
  }

  async getTopClass(logits) {
    const values = await logits.data()
    let predictionList = []

    for (let i = 0; i < values.length; i++) {
      predictionList.push({ value: values[i], index: i })
    }

    predictionList = predictionList
      .sort((a, b) => b.value - a.value)
      .slice(0, 1)

    return predictionList.map(x => {
      return { label: this.classes[x.index], value: x.value }
    })
  }
}

export default Model
