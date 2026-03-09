// ** React Imports
import { forwardRef, useState, useEffect } from 'react'

// ** Third Party Components
import Proptypes from 'prop-types'
import { Badge } from 'reactstrap'
import classnames from 'classnames'

// ** Default avatar when selected image fails to load
import defaultAvatarImg from '@src/assets/images/portrait/small/avatar-s-11.jpg'

const Avatar = forwardRef((props, ref) => {
  // ** Props
  const {
    color,
    className,
    imgClassName,
    initials,
    size,
    badgeUp,
    content,
    icon,
    badgeColor,
    badgeText,
    img,
    imgHeight,
    imgWidth,
    status,
    tag: Tag = 'div',
    contentStyles,
    ...rest
  } = props

  const [imgError, setImgError] = useState(false)
  useEffect(() => {
    setImgError(false)
  }, [img])

  // ** Function to extract initials from content
  const getInitials = str => {
    if (!str || typeof str !== 'string') return ''
    const results = []
    const wordArray = str.split(' ')
    wordArray.forEach(e => {
      if (e[0]) results.push(e[0])
    })
    return results.join('')
  }

  const showImg = img !== false && img !== undefined && img !== '' && !imgError
  const imgSrc = showImg ? img : defaultAvatarImg

  return (
    <Tag
      className={classnames('avatar', {
        [className]: className,
        [`bg-${color}`]: color,
        [`avatar-${size}`]: size,
      })}
      ref={ref}
      {...rest}
    >
      {img === false || img === undefined || img === '' ? (
        <span
          className={classnames('avatar-content', {
            'position-relative': badgeUp,
          })}
          style={contentStyles}
        >
          {initials ? getInitials(content) : content}
          {icon ? icon : null}
          {badgeUp ? (
            <Badge color={badgeColor ? badgeColor : 'primary'} className="badge-sm badge-up" pill>
              {badgeText ? badgeText : '0'}
            </Badge>
          ) : null}
        </span>
      ) : (
        <img
          className={classnames({
            [imgClassName]: imgClassName,
          })}
          src={imgSrc}
          alt="avatarImg"
          height={imgHeight && !size ? imgHeight : 32}
          width={imgWidth && !size ? imgWidth : 32}
          onError={() => setImgError(true)}
        />
      )}
      {status ? (
        <span
          className={classnames({
            [`avatar-status-${status}`]: status,
            [`avatar-status-${size}`]: size,
          })}
        ></span>
      ) : null}
    </Tag>
  )
})

export default Avatar

// ** PropTypes
Avatar.propTypes = {
  imgClassName: Proptypes.string,
  className: Proptypes.string,
  src: Proptypes.string,
  tag: Proptypes.oneOfType([Proptypes.func, Proptypes.string]),
  badgeUp: Proptypes.bool,
  content: Proptypes.string,
  icon: Proptypes.node,
  contentStyles: Proptypes.object,
  badgeText: Proptypes.string,
  imgHeight: Proptypes.oneOfType([Proptypes.string, Proptypes.number]),
  imgWidth: Proptypes.oneOfType([Proptypes.string, Proptypes.number]),
  size: Proptypes.oneOf(['sm', 'lg', 'xl']),
  status: Proptypes.oneOf(['online', 'offline', 'away', 'busy']),
  badgeColor: Proptypes.oneOf([
    'primary',
    'secondary',
    'success',
    'danger',
    'info',
    'warning',
    'dark',
    'light-primary',
    'light-secondary',
    'light-success',
    'light-danger',
    'light-info',
    'light-warning',
    'light-dark',
  ]),
  color: Proptypes.oneOf([
    'primary',
    'secondary',
    'success',
    'danger',
    'info',
    'warning',
    'dark',
    'light-primary',
    'light-secondary',
    'light-success',
    'light-danger',
    'light-info',
    'light-warning',
    'light-dark',
  ]),
  initials(props) {
    if (props['initials'] && props['content'] === undefined) {
      return new Error('content prop is required with initials prop.')
    }
    if (props['initials'] && typeof props['content'] !== 'string') {
      return new Error('content prop must be a string.')
    }
    if (typeof props['initials'] !== 'boolean' && props['initials'] !== undefined) {
      return new Error('initials must be a boolean!')
    }
  },
}
