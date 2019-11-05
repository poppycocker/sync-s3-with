import ora from 'ora'
const progress = require('cli-progress')
import bus from './eventBus'

const spinner1 = ora('listing local directory and S3 bucket...')
const spinner2 = ora('extract files to upload...')

let progressBar: any = null
let barEntire: any = null
let barCurrent: any = null

bus
  .on('start_listing', () => spinner1.start())
  .on('finish_listing', () => spinner1.stop())
  .on('start_extracting', () => spinner2.start())
  .on('finish_extracting', () => spinner2.stop())
  .on('start_uploading', (fileNum: number) => {
    progressBar = new progress.MultiBar(
      {
        clearOnComplete: true,
        hideCursor: true,
        format: '[{bar}] {percentage}% {value}/{total} | ETA: {eta}s | {title} '
      },
      progress.Presets.shades_grey
    )
    barEntire = progressBar.create(fileNum, 0, { title: 'Overall' })
  })
  .on('start_uploading_current', (size: number, name: string) => {
    barCurrent = progressBar.create(size, 0, { title: name })
  })
  .on('tick_uploading_current', (loaded: number) => {
    barCurrent.update(loaded)
  })
  .on('finish_uploading_current', () => {
    progressBar.remove(barCurrent)
    barEntire.increment()
  })
  .on('finish_uploading', () => {
    progressBar.stop()
  })
  .on('show_list', paths => console.log(paths))
  .on('done', () => console.log('done.'))
  .on('error', console.error)
