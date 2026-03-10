import { Component } from 'react'
import CornerstoneViewport from 'react-cornerstone-viewport'
import axios from 'axios'
// ** Import cornerstone
import initCornerstone from '../../../configs/cornerstone-config'

class Viewer extends Component {
  constructor() {
    super()
    initCornerstone()
  }

  state = {
    tools: [
      // Mouse
      {
        name: 'Wwwc',
        mode: 'active',
        modeOptions: { mouseButtonMask: 1 },
      },
      {
        name: 'Zoom',
        mode: 'active',
        modeOptions: { mouseButtonMask: 2 },
      },
      {
        name: 'Pan',
        mode: 'active',
        modeOptions: { mouseButtonMask: 4 },
      },
      // Scroll
      { name: 'StackScrollMouseWheel', mode: 'active' },
      // Touch
      { name: 'PanMultiTouch', mode: 'active' },
      { name: 'ZoomTouchPinch', mode: 'active' },
      { name: 'StackScrollMultiTouch', mode: 'active' },
    ],

    imageIds: [],
  }

  componentDidMount() {
    this.getUrlStr()
  }

  async getUrlStr() {
    const query = Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    )

    for (const level in query) {
      if (level === 'series') {
        const Instances = await axios({
          method: 'GET',
          url: `${process.env.REACT_APP_API_URL}/explorer/series/${query[level]}/instances`,
        }).then((doc) => {
          doc = doc.data.sort((a, b) => {
            if (a['IndexInSeries'] && b['IndexInSeries']) {
              return a['IndexInSeries'] - b['IndexInSeries']
            } else {
              return 0
            }
          })

          return doc.map((instance) => {
            return `dicomweb:${process.env.REACT_APP_API_URL}/orthanc/instances/${instance.ID}/file`
          })
        })

        this.setState((state, props) => {
          return {
            ...state,
            imageIds: Instances,
          }
        })
      } else {
        this.setState((state, props) => {
          return {
            ...state,
            imageIds: [
              `dicomweb:${process.env.REACT_APP_API_URL}/explorer/instances/${query[level]}/file`,
            ],
          }
        })
      }
    }
  }

  render() {
    return (
      <div style={{ height: '100vh' }}>
        {this.state.imageIds.length ? (
          <CornerstoneViewport
            tools={this.state.tools}
            imageIds={this.state.imageIds}
            style={{ minWidth: '100%', height: '100%', flex: '1' }}
          />
        ) : (
          ''
        )}
      </div>
    )
  }
}

export default Viewer
