import { Args } from './interfaces'
import bus from './eventBus'
import scanLocal from './scanLocal'
import scanBucket from './scanBucket'
import extractFilesToUpload from './extractFilesToUpload'
import uploadToS3 from './uploadToS3'

async function sync(args: Args) {
  const exculde = args.exclude ? new RegExp(args.exclude) : null
  bus.emit('start_listing')
  const [localFiles, s3Keys] = await Promise.all([
    scanLocal(args.rootOfLocal, exculde),
    scanBucket(args)
  ])
  bus.emit('finish_listing')
  bus.emit('start_extracting')
  const localPathsToUpload = extractFilesToUpload(
    localFiles,
    s3Keys,
    args.rootOfLocal,
    args.bucket.split('/')[1]
  )
  bus.emit('finish_extracting')
  if (!args.onlyListing) {
    bus.emit('start_uploading', localPathsToUpload.length)
    await uploadToS3(localPathsToUpload, args.rootOfLocal, args)
    bus.emit('finish_uploading')
  }
  return localPathsToUpload
}

export default sync
