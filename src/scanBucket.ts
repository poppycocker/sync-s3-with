import AWS from 'aws-sdk'
import { S3BucketProps } from './interfaces'

async function scanBucket(bucketProp: S3BucketProps): Promise<string[]> {
  AWS.config.update({
    credentials: new AWS.Credentials(
      bucketProp.accessKeyId,
      bucketProp.secretAccessKey
    ),
    region: bucketProp.region
  })
  const [bucketName, baseDir] = bucketProp.bucket.split('/')
  const isDirectory = /\/$/
  const isUnderRoot = new RegExp(baseDir ? `^${baseDir + '/'}.+` : '.+')
  const s3 = new AWS.S3()
  const keys = []
  let continuationToken = null
  while (true) {
    const params: AWS.S3.ListObjectsV2Request = {
      Bucket: bucketName
    }
    if (continuationToken) {
      params.ContinuationToken = continuationToken
    }
    const res = await s3.listObjectsV2(params).promise()
    const filesOnly = (res.Contents || [])
      .map(v => v.Key || '')
      .filter(key => !!key && !key.match(isDirectory))
      .filter(key => !!key && key.match(isUnderRoot))

    keys.push(...filesOnly)
    if (!res.IsTruncated) {
      break
    }
    continuationToken = res.NextContinuationToken
  }
  return keys
}

export default scanBucket
