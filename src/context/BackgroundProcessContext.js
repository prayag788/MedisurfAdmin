import React, { createContext, useState, useCallback } from 'react'
import { socket } from '../socket'

export const BackgroundProcessContext = createContext({
  isActive: false,
  message: '',
  showBackgroundLoader: () => {},
  hideBackgroundLoader: () => {},
})

const DEFAULT_MESSAGE = 'Processing...'

export const BackgroundProcessProvider = ({ children, userData }) => {
  const [isActive, setIsActive] = useState(false)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)

  const showBackgroundLoader = useCallback((msg = DEFAULT_MESSAGE) => {
    setMessage(msg)
    setIsActive(true)
  }, [])

  const hideBackgroundLoader = useCallback(() => {
    setIsActive(false)
    setMessage(DEFAULT_MESSAGE)
  }, [])

  React.useEffect(() => {
    const userId = userData?._id
    if (!userId) return

    const onCompleted = () => {
      hideBackgroundLoader()
    }

    socket.on(`completedPatientEditProcess_${userId}`, onCompleted)
    return () => {
      socket.off(`completedPatientEditProcess_${userId}`, onCompleted)
    }
  }, [userData?._id, hideBackgroundLoader])

  const value = {
    isActive,
    message,
    showBackgroundLoader,
    hideBackgroundLoader,
  }

  return (
    <BackgroundProcessContext.Provider value={value}>
      {children}
    </BackgroundProcessContext.Provider>
  )
}
