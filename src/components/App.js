import React, { Component } from 'react'
import Dropzone from 'react-dropzone'

import Footer from './Footer'
import Header from './Header'
import Message from './Message'
import Results from './Results'

import sampleImg from '../img/oefen_data/kankercellen_000.jpg'
import { CancerNet } from '../ml/models'
import { readFile, nextFrame } from '../util'

class App extends Component {
  state = {
    ready: false,
    loading: false,
    imgs: [],
    imgUrls: [sampleImg],
    classifications: [],
  }

  componentDidMount() {
    this.initModels()
  }

  async initModels() {
    const cancerModel = new CancerNet()
    await cancerModel.load()

    this.models = { cancer: cancerModel }
    this.setState({ ready: true }, this.initPredict)
  }

  async initPredict()  {
    let imgs = [...document.getElementsByClassName('images')]
    if (imgs.length === 0) return
    let allCompleted = imgs.every(img => img.complete)
    if (!allCompleted) return
    this.setState({ loading: true })
    this.analyzeImages()
  }

  handleImgLoaded() {
    let imgs = [...document.getElementsByClassName('images')]
    if (imgs.length === 0) return
    let allCompleted = imgs.every(img => img.complete)
    if (!allCompleted) return
    this.setState({ loading: true })    
    this.analyzeImages()
  }

  handleUpload = async files => {
    if (!files.length) return
    let fileUrls = []
    for (let i = 0; i < files.length; ++i) {
      fileUrls.push((await readFile(files[i])).url)
    }
    this.setState({
      imgUrls: fileUrls,
      loading: true,
      classifications: [],
    })
  }

  async analyzeImages () {
    await nextFrame()

    if (!this.models) return

    // get predictions
    let imgs = [...document.getElementsByClassName('images')]
    let classifications = await this.models.cancer.classify(imgs)
    this.setState(
      { loading: false, classifications: classifications },
    )
  }

  render() {
    const { ready, imgUrls, loading, classifications } = this.state
    const noClassifications= ready && !loading && imgUrls && !classifications.length
    let returnResult = (
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
          <div className="relative">
          {imgUrls &&
            imgUrls.map((imgUrl, i) => (
                <img style={ {padding: "5px"} }
                  key={i}
                  className="images"
                  onLoad={this.handleImgLoaded.bind(this)}
                  src={imgUrl}
                  alt=""
                />
          ))}
          </div>          
          {!ready && <Message>Slimme computer laden...</Message>}
          {loading && <Message>Plaatje bekijken...</Message>}
          {noClassifications && (
            <Message bg="red" color="white">
              <strong>Sorry!</strong> Er kon niks worden geclassificeerd.
            </Message>
          )}
          {classifications.length > 0 && <Results patches={[...document.getElementsByClassName('images')]} classifications={classifications} />}
        </main>
        <Footer />
      </div>
    )
    return returnResult
  }
}

export default App
