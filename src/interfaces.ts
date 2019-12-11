export interface S3BucketProps {
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  storageClass: string
}

export interface Args {
  rootOfLocal: string
  exclude: string
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  storageClass: string
  onlyListing: Boolean
}
