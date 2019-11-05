import args from './commandLineArgs'
import sync from './sync'
import bus from './eventBus'
import './showProgress'

if (!args.rootOfLocal.match(/\/$/)) {
  args.rootOfLocal += '/'
}

sync(args)
  .then(localPathsToUpload => {
    if (args.onlyListing) {
      bus.emit('show_list', localPathsToUpload)
    }
    bus.emit('done')
  })
  .catch(err => bus.emit('error', err))
