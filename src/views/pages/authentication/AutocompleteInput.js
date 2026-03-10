import { useEffect, useState } from 'react'
import Autosuggest from 'react-autosuggest'
import CustomSuggestion from './CustomSuggestion'
import user from '@src/assets/images/login/user.png'

const CustomInput = (props) => {
  return (
    <div className="input-group">
      <input
        {...{
          ...props,
        }}
      />
      <img src={user} alt="" />
    </div>
  )
}

const AutocompleteInput = ({
  suggestions,
  onSuggestionSelected,
  handleDelete,
}) => {
  const [value, setValue] = useState('')
  const [suggestionsList, setSuggestionsList] = useState([])
  const [isShow, setIsShow] = useState(false)

  const getSuggestions = (inputValue) => {
    const inputValueLower = inputValue.trim().toLowerCase()
    const inputLength = inputValueLower.length

    return inputLength === 0
      ? []
      : suggestions.filter(
          (suggestion) =>
            suggestion.label.toLowerCase().slice(0, inputLength) ===
            inputValueLower
        )
  }

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestionsList(getSuggestions(value))
  }

  const onSuggestionsClearRequested = () => {
    setSuggestionsList([])
  }

  const onChange = (event, { newValue }) => {
    setValue(newValue)
  }

  const onSuggestionSelectedHandler = (suggestion) => {
    setValue(suggestion.label)
  }

  const generateRandomString = (length) => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      result += characters.charAt(randomIndex)
    }

    return result
  }

  const inputProps = {
    placeholder: 'john@example.com',
    value,
    onChange,
    name: generateRandomString(10),
    autocomplete: 'new-password',
  }

  useEffect(() => {
    if (onSuggestionSelected) {
      onSuggestionSelected({
        label: value,
      })
    }
  }, [value])

  useEffect(() => {
    let isAval = false
    console.log(suggestions)
    suggestions.map((suggestion) => {
      if (!isAval) {
        isAval = suggestion.label === value
      }
    })

    if (!isAval) {
      setValue('')
    }
  }, [suggestions])

  return (
    <Autosuggest
      suggestions={suggestionsList}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={(suggestion) => suggestion.label}
      renderSuggestion={(suggestion) => (
        <CustomSuggestion
          suggestion={suggestion}
          onSuggestionSelectedHandler={onSuggestionSelectedHandler}
          handleDelete={handleDelete}
        />
      )}
      renderInputComponent={(inputProps) => <CustomInput {...inputProps} />}
      inputProps={inputProps}
    />
  )
}

export default AutocompleteInput
