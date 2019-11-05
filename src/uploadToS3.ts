import fs, { promises as fsp } from 'fs'
import path from 'path'
import AWS from 'aws-sdk'
import { S3BucketProps } from './interfaces'
import bus from './eventBus'

async function uploadToS3(
  localPathsToUpload: string[],
  rootOfLocal: string,
  bucketProp: S3BucketProps
) {
  AWS.config.update({
    credentials: new AWS.Credentials(
      bucketProp.accessKeyId,
      bucketProp.secretAccessKey
    ),
    region: bucketProp.region
  })
  const [bucketName, baseDir] = bucketProp.bucket.split('/')
  const s3 = new AWS.S3()

  for (const [idx, localPath] of localPathsToUpload.entries()) {
    const fileStream = fs.createReadStream(localPath)
    fileStream.on('error', err => bus.emit('error', err))
    const key = `${baseDir ? baseDir + '/' : ''}${localPath
      .slice(rootOfLocal.length)
      .replace(path.sep, '/')
      .normalize()}`

    bus.emit(
      'start_uploading_current',
      fs.statSync(localPath).size,
      path.basename(localPath)
    )
    await s3
      .upload({
        Bucket: bucketName,
        Key: key,
        Body: fileStream
      })
      .on('httpUploadProgress', p =>
        bus.emit('tick_uploading_current', p.loaded)
      )
      .promise()
    bus.emit('finish_uploading_current')
  }
}

export default uploadToS3
