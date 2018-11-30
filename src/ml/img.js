import * as tf from '@tensorflow/tfjs'

const NORMALIZATION_OFFSET = tf.scalar(127.5)

export function prepImg(img, size) {
  return tf.tidy(() => {
    // Convert to tensor
    const imgTensor = tf.fromPixels(img)

    // Normalize from [0, 255] to [-1, 1].
    const normalized = imgTensor
      .toFloat()
      .sub(NORMALIZATION_OFFSET)
      .div(NORMALIZATION_OFFSET)

    let alignCorners = true
    if (imgTensor.shape[0] === size && imgTensor.shape[1] === size) {
      return normalized
    } else if ((imgTensor.shape[0] < size || imgTensor.shape[1] < size)) {
      return tf.image.resizeBilinear(normalized, [size, size], alignCorners)
    } else if ((imgTensor.shape[0] >= size || imgTensor.shape[1] >= size)) {
      let offsetX = Math.floor((imgTensor.shape[0] - 299) / 2)
      let offsetY = Math.floor((imgTensor.shape[1] - 299) / 2)
      offsetX = offsetX < 0 ? 0 : offsetX
      offsetY = offsetY < 0 ? 0 : offsetY
      let sizeX = imgTensor.shape[0] > 299 ? 299 : imgTensor.shape[0]
      let sizeY = imgTensor.shape[1] > 299 ? 299 : imgTensor.shape[1]
      let cropped = normalized.slice([offsetX,offsetY,0], [sizeX,sizeY,3])
      return cropped
    }})
  }