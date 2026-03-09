// TinyMCE cursor position fix utility
export const createTinyMCEConfig = (onContentChange, editorRef) => {
  let isUpdating = false

  return {
    onEditorChange: (content, editor) => {
      if (isUpdating) return

      // Store cursor position
      const bookmark = editor.selection.getBookmark()

      // Update content without triggering re-render
      if (onContentChange) {
        onContentChange(content)
      }

      // Restore cursor position after a short delay
      setTimeout(() => {
        if (editor && bookmark) {
          editor.selection.moveToBookmark(bookmark)
        }
      }, 0)
    },

    onInit: (evt, editor) => {
      if (editorRef) {
        editorRef.current = editor
      }

      // Prevent cursor jumping on programmatic updates
      editor.on('SetContent', e => {
        if (e.initial) return
        isUpdating = true
        setTimeout(() => {
          isUpdating = false
        }, 100)
      })

      return editor
    },

    init: {
      file_picker_type: 'image',
      images_replace_base64: false,
      height: 500,
      menubar: true,
      branding: false,
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
        'help',
        'wordcount',
        'image',
      ],
      toolbar:
        'undo redo | formatselect | code ' +
        'bold italic backcolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help | image',
      content_style:
        'body { font-family:Helvetica,Arial,sans-serif; font-size:14px } ' +
        '.mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { white-space: pre-line; } ' +
        '.mce-content-body p { margin: 0; padding: 0; margin-block: 0; margin-inline: 0; line-height: normal; }',
      setup: editor => {
        // Prevent cursor reset on external updates
        editor.on('focus', () => {
          editor.undoManager.transact(() => {
            // Empty transaction to maintain undo state
          })
        })
      },
    },
  }
}
