const commandLineArgs = require('command-line-args')
import { Args } from './interfaces'

const optionDefinitions = [
  {
    name: 'rootOfLocal',
    alias: 'l',
    type: String
  },
  {
    name: 'exclude',
    alias: 'e',
    type: String,
    defaultValue: ''
  },
  {
    name: 'region',
    alias: 'r',
    type: String
  },
  {
    name: 'bucket',
    alias: 'b',
    type: String
  },
  {
    name: 'accessKeyId',
    alias: 'a',
    type: String
  },
  {
    name: 'secretAccessKey',
    alias: 's',
    type: String
  },
  {
    name: 'storageClass',
    type: String,
    defaultValue: 'STANDARD'
  },
  {
    name: 'onlyListing',
    type: Boolean,
    defaultValue: false
  }
]
const args: Args = commandLineArgs(optionDefinitions)

export default args
