import DaoClient from './index.js'
import Ballot from './ballot.js'
import {ContractErrors} from './errors.js'

DaoClient.Ballot = Ballot
DaoClient.ContractErrors = ContractErrors

export default DaoClient