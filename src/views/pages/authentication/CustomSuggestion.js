import xMark from '@src/assets/images/login/x-mark.png'

const CustomSuggestion = ({ suggestion, onSuggestionSelectedHandler, handleDelete }) => {
  return (
    <div className={`suggestion-item`}>
      <span
        onClick={e => {
          onSuggestionSelectedHandler(suggestion)
        }}
      >
        {suggestion.label}
      </span>
      <button
        type="button"
        onClick={e => {
          handleDelete(suggestion)
        }}
        className="add-new-button"
      >
        <img src={xMark} />
      </button>
    </div>
  )
}

export default CustomSuggestion
