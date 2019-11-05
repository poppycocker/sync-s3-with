import path from 'path'
import shell from 'shelljs'
import AWS, { Pricing } from 'aws-sdk'
import args from '../src/commandLineArgs'
import { Args } from '../src/interfaces'
import uploadToS3 from '../src/uploadToS3'
import scanBucket from '../src/scanBucket'
import sync from '../src/sync'

const BUCKET_NAME = 'ppycckr-testes'
const TARGET_DIR = 'tmp'
const CHILD_DIR = 'child'

function wait(ms: number) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

async function deleteBucket(s3: AWS.S3) {
  try {
    const keysOnS3 = await scanBucket(args)
    for (const key of keysOnS3) {
      await s3
        .deleteObject({
          Bucket: BUCKET_NAME,
          Key: key
        })
        .promise()
    }
    await s3
      .deleteBucket({
        Bucket: BUCKET_NAME
      })
      .promise()
  } catch (e) {
    // nothing to do
  }
}

async function test() {
  console.log('> setup')
  args.rootOfLocal = path.join(__dirname, TARGET_DIR) + path.sep
  shell.rm('-rf', args.rootOfLocal)
  shell.mkdir('-p', args.rootOfLocal)
  args.bucket = BUCKET_NAME
  AWS.config.update({
    credentials: new AWS.Credentials(args.accessKeyId, args.secretAccessKey),
    region: args.region
  })
  const s3 = new AWS.S3()
  await deleteBucket(s3)
  let success = true

  console.log('> create bucket.')
  await s3
    .createBucket({
      Bucket: BUCKET_NAME,
      ACL: 'private'
    })
    .promise()

  console.log('> create files a, b for test.')
  const fileA = 'a.txt'
  const fileB = 'b.txt'
  const pathA = path.join(args.rootOfLocal, fileA)
  const pathB = path.join(args.rootOfLocal, fileB)
  shell.touch(pathA)
  shell.touch(pathB)

  console.log('> upload a, b')
  await uploadToS3([pathA, pathB], args.rootOfLocal, args)
  await wait(3000)

  console.log('> create file c and dotfile')
  const fileC = 'c.txt'
  const fileDot = '.dot'
  const pathC = path.join(args.rootOfLocal, fileC)
  const pathDot = path.join(args.rootOfLocal, fileDot)
  shell.touch(pathC)
  shell.touch(pathDot)

  console.log('> [check] only c is extracted.')
  args.onlyListing = true
  const paths2UL = await sync(args)
  if (paths2UL.length === 1 && !!paths2UL[0].match(new RegExp(fileC))) {
    console.log('>> [OK] only c is extracted.')
  } else {
    console.error(`>> [NG] extracted: ${paths2UL.join(', ')}`)
    success = false
  }

  console.log('> sync.')
  args.onlyListing = false
  await sync(args)
  await wait(3000)

  console.log('> [check] bucket contents.')
  let keysOnS3 = await scanBucket(args)
  if (keysOnS3.length === 3) {
    console.log('>> [OK] bucket contains 3 files.')
  } else {
    console.error(`>> [NG] bucket contains ${keysOnS3.length} files.`)
    success = false
  }

  console.log('> create file d in child dir.')
  args.rootOfLocal = path.join(args.rootOfLocal, CHILD_DIR) + path.sep
  args.bucket += `/${CHILD_DIR}`
  shell.mkdir('-p', path.join(args.rootOfLocal))
  const fileD = 'd.txt'
  const pathD = path.join(args.rootOfLocal, fileD)
  shell.touch(pathD)

  console.log('> sync child dir.')
  await sync(args)
  await wait(3000)

  console.log('> [check] bucket/child contents.')
  keysOnS3 = await scanBucket(args)
  if (keysOnS3.length === 1) {
    console.log('>> [OK] bucket/child contains 1 file.')
  } else {
    console.error(`>> [NG] bucket/child contains ${keysOnS3.length} file(s).`)
    success = false
  }

  if (success) {
    args.rootOfLocal = path.join(__dirname, TARGET_DIR) + path.sep
    args.bucket = BUCKET_NAME

    console.log('> delete bucket.')
    await deleteBucket(s3)
    console.log('> delete files for test.')
    shell.rm('-rf', args.rootOfLocal)
  }
}

test()
  .then(() => console.log('> done.'))
  .catch(e => console.error(e))
