import { Ability } from '@casl/ability'
import { initialAbility } from './initialAbility'

//  Read ability from localStorage
// * Handles auto fetching previous abilities if already logged in user

const userData = JSON.parse(localStorage.getItem('userData'))
const existingAccessAbility = userData ? userData.access : null

const seen = new Set()
const existingAbility = Array.isArray(existingAccessAbility)
  ? existingAccessAbility.filter(item => {
      const key = `${item.action}-${item.subject}`
      if (!seen.has(key)) {
        seen.add(key)
        return true
      }
      return false
    })
  : []

export default new Ability(existingAbility || initialAbility)
