// ** Styles
import { useState, useRef } from 'react'
import JoditEditor from 'jodit-react'

const JoditEditorComponent = ({ placeholder }) => {
  const editor = useRef(null)
  const [content, setContent] = useState('')

  const editorConfig = {
    readonly: false,
    toolbar: true,
    spellcheck: true,
    language: 'en',
    toolbarButtonSize: 'medium',
    toolbarAdaptive: true,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    defaultActionOnPaste: 'insert_clear_html',

    uploader: {
      insertImageAsBase64URI: true,
    },

    controls: {
      font: {
        command: 'fontname',
        list: {
          "'Open Sans',sans-serif": 'Open Sans',
          'Helvetica,sans-serif': 'Helvetica',
          'Arial,Helvetica,sans-serif': 'Arial',
          'Georgia,serif': 'Georgia',
          'Impact,Charcoal,sans-serif': 'Impact',
          'Tahoma,Geneva,sans-serif': 'Tahoma',
          "'Times New Roman',Times,serif": 'Times New Roman',
          'Verdana,Geneva,sans-serif': 'Verdana',
          'Consolas,monaco,monospace': 'Consolas',
        },
      },
    },
  }

  return (
    <JoditEditor
      ref={editor}
      value={content}
      config={editorConfig}
      tabIndex={1} // tabIndex of textarea
      onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
      onChange={newContent => {}}
    />
  )
}

export default JoditEditorComponent
