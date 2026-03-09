import React, { useContext } from 'react'
import { BackgroundProcessContext } from '../context/BackgroundProcessContext'

/**
 * Small fixed loader shown on the side during background processes (e.g. study edit, sync).
 * Does not block the UI; user can continue using the app.
 * Only the spinner rotates; the message text stays static.
 */
const BackgroundProcessLoader = () => {
  const { isActive, message } = useContext(BackgroundProcessContext)

  if (!isActive) return null

  return (
    <>
      <style>{`
        .background-process-loader .background-process-loader__text {
          animation: none !important;
          transform: none !important;
        }
      `}</style>
      <div
        className="background-process-loader"
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'var(--bs-body-bg, #fff)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid var(--bs-border-color, #dee2e6)',
          fontSize: '0.8125rem',
          color: 'var(--bs-body-color, #333)',
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className="spinner-border spinner-border-sm text-primary"
          role="status"
          style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }}
        >
          {/* <span className="visually-hidden">Loading</span> */}
        </div>
        <span className="background-process-loader__text" style={{ whiteSpace: 'nowrap' }}>
          {message}
        </span>
      </div>
    </>
  )
}

export default BackgroundProcessLoader
