// ** Third Party Components
import { Fragment } from 'react'
import Proptypes from 'prop-types'
import classnames from 'classnames'
import { Spinner } from 'reactstrap'

import './ui-loader.scss'

const UILoader = (props) => {
  const {
    children,
    blocking = false,
    loader = <Spinner color="primary" />,
    className,
    tag = 'div',
    overlayColor,
  } = props

  const Tag = tag

  return (
    <Tag
      className={classnames('ui-loader', {
        [className]: className,
        show: blocking,
      })}
    >
      {children}
      {blocking ? (
        <Fragment>
          <div
            className="overlay"
            {...(blocking && overlayColor
              ? { style: { backgroundColor: overlayColor } }
              : {})}
          ></div>
          <div className="loader">{loader}</div>
        </Fragment>
      ) : null}
    </Tag>
  )
}

export default UILoader

UILoader.propTypes = {
  tag: Proptypes.string,
  loader: Proptypes.any,
  className: Proptypes.string,
  overlayColor: Proptypes.string,
  blocking: Proptypes.bool.isRequired,
}
