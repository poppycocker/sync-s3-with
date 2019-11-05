import path from 'path'

function extractFilesToUpload(
  localPaths: string[],
  s3Keys: string[],
  rootOfLocal: string,
  baseDirInBucket: string = ''
): string[] {
  const localPathsRelative = localPaths.map(
    localPath =>
      localPath
        .slice(rootOfLocal.length)
        .replace(path.sep, '/')
        .normalize() // for mac
  )
  const s3KeysRelative = baseDirInBucket
    ? // +1 for suffix '/'
      s3Keys.map(s3Key => s3Key.slice(baseDirInBucket.length + 1))
    : s3Keys
  const extracted = localPathsRelative
    .filter(p => !s3KeysRelative.includes(p))
    .map(p => rootOfLocal + p)
  return extracted
}

export default extractFilesToUpload
