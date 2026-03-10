import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Editor } from '@tinymce/tinymce-react'

const EditorWrapper = ({
  initialValue = '',
  onEditorChange,
  onEditorReady,
  placeholder = '',
  height = 500,
  disabled = false,
  editorId = 'default-editor',
}) => {
  const editorRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const handleEditorInit = useCallback(
    (evt, editor) => {
      console.log(`📝 [EditorWrapper-${editorId}] Editor init called`)

      // Add multiple validation layers with retry mechanism
      const validateAndSetEditor = (attempt = 1) => {
        try {
          console.log(
            `📝 [EditorWrapper-${editorId}] Validation attempt ${attempt}/${maxRetries}`
          )

          // CRITICAL: Comprehensive validation before setting editor reference
          if (!editor) {
            console.warn(
              `📝 [EditorWrapper-${editorId}] Editor object is null or undefined`
            )
            if (attempt < maxRetries) {
              setTimeout(() => validateAndSetEditor(attempt + 1), 200 * attempt)
              return
            }
            setIsReady(false)
            return
          }

          // Check if editor has required methods
          if (
            typeof editor.getContainer !== 'function' ||
            typeof editor.getContent !== 'function'
          ) {
            console.warn(
              `📝 [EditorWrapper-${editorId}] Editor methods not available`
            )
            if (attempt < maxRetries) {
              setTimeout(() => validateAndSetEditor(attempt + 1), 200 * attempt)
              return
            }
            setIsReady(false)
            return
          }

          // Validate DOM container
          let container
          try {
            container = editor.getContainer()
          } catch (containerError) {
            console.error(
              `📝 [EditorWrapper-${editorId}] getContainer() error:`,
              containerError
            )
            if (attempt < maxRetries) {
              setTimeout(() => validateAndSetEditor(attempt + 1), 200 * attempt)
              return
            }
            setIsReady(false)
            return
          }

          if (!container) {
            console.warn(`📝 [EditorWrapper-${editorId}] Container is null`)
            if (attempt < maxRetries) {
              setTimeout(() => validateAndSetEditor(attempt + 1), 200 * attempt)
              return
            }
            setIsReady(false)
            return
          }

          // Enhanced DOM validation
          if (
            typeof Node !== 'undefined' &&
            container.nodeType !== Node.ELEMENT_NODE
          ) {
            console.warn(
              `📝 [EditorWrapper-${editorId}] Container is not a valid DOM element`
            )
            if (attempt < maxRetries) {
              setTimeout(() => validateAndSetEditor(attempt + 1), 200 * attempt)
              return
            }
            setIsReady(false)
            return
          }

          if (!container.parentNode) {
            console.warn(
              `📝 [EditorWrapper-${editorId}] Container has no parent node`
            )
            if (attempt < maxRetries) {
              setTimeout(() => validateAndSetEditor(attempt + 1), 200 * attempt)
              return
            }
            setIsReady(false)
            return
          }

          // Validate container is attached to document
          if (
            typeof document !== 'undefined' &&
            !document.contains(container)
          ) {
            console.warn(
              `📝 [EditorWrapper-${editorId}] Container is not attached to document`
            )
            if (attempt < maxRetries) {
              setTimeout(() => validateAndSetEditor(attempt + 1), 200 * attempt)
              return
            }
            setIsReady(false)
            return
          }

          // All validations passed
          editorRef.current = editor
          setIsReady(true)
          setRetryCount(0)

          console.log(
            `✅ [EditorWrapper-${editorId}] Editor initialized successfully on attempt ${attempt}`
          )

          // Notify parent component
          if (onEditorReady && typeof onEditorReady === 'function') {
            onEditorReady(editor)
          }
        } catch (error) {
          console.error(
            `📝 [EditorWrapper-${editorId}] Validation error on attempt ${attempt}:`,
            error
          )
          if (attempt < maxRetries) {
            setTimeout(() => validateAndSetEditor(attempt + 1), 200 * attempt)
            return
          }
          setIsReady(false)
          editorRef.current = null
        }
      }

      // Start validation with a small delay to ensure DOM is ready
      setTimeout(() => validateAndSetEditor(1), 100)
    },
    [editorId, onEditorReady, maxRetries]
  )

  const handleEditorChange = useCallback(
    (content, editor) => {
      if (onEditorChange && typeof onEditorChange === 'function') {
        onEditorChange(content, editor)
      }
    },
    [onEditorChange]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          if (typeof editorRef.current.destroy === 'function') {
            editorRef.current.destroy()
          }
        } catch (destroyError) {
          console.warn(
            `📝 [EditorWrapper-${editorId}] Error destroying editor:`,
            destroyError
          )
        }
        editorRef.current = null
      }
      setIsReady(false)
    }
  }, [editorId])

  return (
    <div className="editor-wrapper">
      <Editor
        key={`editor-${editorId}-${retryCount}`}
        onInit={handleEditorInit}
        onEditorChange={handleEditorChange}
        initialValue={initialValue}
        disabled={disabled}
        init={{
          height,
          menubar: true,
          selector: undefined,
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'insertdatetime',
            'table',
            'code',
            'help',
            'wordcount',
          ],
          toolbar:
            'undo redo | formatselect | code' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | image',
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px } .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { white-space: pre-line;} .mce-content-body p { margin: 0; padding: 0; margin-block: 0; margin-inline: 0; line-height: normal; }',
          placeholder:
            placeholder ||
            `Anything entered here will be added to the report layout chosen from the diagnosis template,\n To see the exact report, click on the preview.\n Preview will only works once you created the report.\n Download will only works after finalization of the report\n Press Shift+Enter to continue below this line.`,
          setup: (editor) => {
            // Additional setup if needed
            editor.on('LoadContent', () => {
              console.log(`📝 [EditorWrapper-${editorId}] Content loaded`)
            })
          },
        }}
      />
      {!isReady && (
        <div
          className="editor-loading"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: 'rgba(255,255,255,0.9)',
            padding: '10px',
            borderRadius: '4px',
          }}
        >
          Loading editor...
        </div>
      )}
    </div>
  )
}

export default EditorWrapper
