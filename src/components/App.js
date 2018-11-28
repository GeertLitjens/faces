import debounce from 'lodash.debounce'
import React, { Component } from 'react'
import Dropzone from 'react-dropzone'

import Footer from './Footer'
import Header from './Header'
import Message from './Message'
import Results from './Results'

import sampleImg from '../img/cancer.png'
import { CancerNet } from '../ml/models'
import { readFile, nextFrame } from '../util'

class App extends Component {
  state = {
    ready: false,
    loading: false,
    imgUrl: sampleImg,
    classifications: [],
  }

  componentDidMount() {
    this.initModels()
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  async initModels() {
    const cancerModel = new CancerNet()
    await cancerModel.load()

    this.models = { cancer: cancerModel }
    this.setState({ ready: true }, this.initPredict)
  }

  async initPredict()  {
    if (!this.img || !this.img.complete) return
    this.setState({ loading: true })
    this.analyzeImages()
  }

  handleImgLoaded() {
    this.clearCanvas()
    this.analyzeImages()
  }

  handleResize = debounce(() => this.drawDetections(), 100)

  handleUpload = async files => {
    if (!files.length) return
    const fileData = await readFile(files[0])
    this.setState({
      imgUrl: fileData.url,
      loading: true,
      classifications: [],
    })
  }

  async analyzeImages () {
    await nextFrame()

    if (!this.models) return

    // get predictions
    let classifications = await this.models.cancer.classify(this.img)
    this.setState(
      { loading: false, classifications },
      this.drawDetections
    )
  }

  clearCanvas() {
    this.canvas.width = 0
    this.canvas.height = 0
  }

  async drawDetections() {
    const { classifications } = this.state
    if (!classifications.length) return

    const { width, height } = this.img
    this.canvas.width = width
    this.canvas.height = height
  }

  render() {
    const { ready, imgUrl, loading, classifications } = this.state
    const noClassifications= ready && !loading && imgUrl && !classifications.length

    return (
      <div className="px2 mx-auto container app">
        <Header />
        <main>
          <div className="py1">
            <Dropzone
              className="btn btn-small btn-primary btn-upload bg-black h5"
              accept="image/jpeg, image/png"
              multiple={true}
              disabled={!ready}
              onDrop={this.handleUpload}
            >
              Probeer een plaatje!
            </Dropzone>
          </div>
          {imgUrl && (
            <div className="relative">
              <img
                ref={el => (this.img = el)}
                onLoad={this.handleImgLoaded.bind(this)}
                src={imgUrl}
                alt=""
              />
              <canvas
                ref={el => (this.canvas = el)}
                className="absolute top-0 left-0"
              />
            </div>
          )}
          {!ready && <Message>Slimme computer laden...</Message>}
          {loading && <Message>Plaatje bekijken...</Message>}
          {noClassifications && (
            <Message bg="red" color="white">
              <strong>Sorry!</strong> Er kon niks worden geclassificeerd.
            </Message>
          )}
          {classifications.length > 0 && <Results patches={[this.img]} classifications={classifications} />}
        </main>
        <Footer />
      </div>
    )
  }
}

export default App
