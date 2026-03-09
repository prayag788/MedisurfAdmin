import { Resizable } from 'react-resizable'

const ResizableTitle = ({ onResize, width, ...restProps }) => {
  if (!width) {
    return <th {...restProps} />
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={(_, { size }) => {
        onResize(size.width)
      }}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  )
}

export default ResizableTitle
