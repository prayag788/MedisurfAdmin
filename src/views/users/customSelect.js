import Select from 'react-select'
import classnames from 'classnames'
import { selectThemeColors } from '@utils'

export default function CustomSelect({ options, isValid, selectHandler, name, defaultValue }) {
  const invalid = {
    control: (provided, state) => ({
      ...provided,
      borderColor: 'red',
      '&:hover': {
        borderColor: 'red',
      },
      cursor: 'pointer',
    }),
  }
  const regular = {
    control: (provided, state) => ({
      ...provided,
      borderColor: '#d8d6de',
    }),
  }

  return (
    <>
      <Select
        isClearable={false}
        theme={selectThemeColors}
        styles={isValid ? regular : invalid}
        isMulti
        defaultValue={defaultValue ? defaultValue : []}
        name={name}
        options={options}
        className="react-select"
        classNamePrefix="select"
        className={classnames({ 'is-invalid': !isValid })}
        onChange={selectHandler}
      />
    </>
  )
}
