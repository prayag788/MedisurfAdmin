import { useState, useEffect } from 'react'
import CornerstoneViewport from 'react-cornerstone-viewport'
import { useParams } from 'react-router-dom'
// ** Import cornerstone
import initCornerstone from '../../configs/cornerstone-config'

const Viewer = () => {
  const { studyId } = useParams()
  const [imageIds, setImageIds] = useState([])

  const tools = [
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
  ]

  const getInstances = async () => {
    try {
      const study = await fetch(
        `${process.env.REACT_APP_API_URL}/orthanc/studies/${studyId}`
      )
        .then((res) => res.json())
        .then((doc) => doc)

      const Instances = await fetch(
        `${process.env.REACT_APP_API_URL}/orthanc/series/${study.Series[0]}`
      )
        .then((res) => res.json())
        .then((doc) => {
          return doc.Instances.map((instance) => {
            return `dicomweb:${process.env.REACT_APP_API_URL}/orthanc/instances/${instance}/file`
          })
        })

      setImageIds(Instances)
    } catch (error) {
      console.error('Error fetching instances:', error)
    }
  }

  useEffect(() => {
    initCornerstone()
    getInstances()
  }, [])

  return (
    <div style={{ height: '100vh' }}>
      {imageIds.length ? (
        <CornerstoneViewport
          tools={tools}
          imageIds={imageIds}
          style={{ minWidth: '100%', height: '100%', flex: '1' }}
        />
      ) : (
        ''
      )}
    </div>
  )
}

export default Viewer
