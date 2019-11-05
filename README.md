# sync-s3-with

a Node.js CLI tool for synchronizing s3 with local files.  
(sync is one-way traffic, upload only.)

## Project setup

`npm install` or `yarn install`

## Run as CLI tool

```sh
npx ts-node src/index.ts -l "path/to/dir/to/sync" -e "" -r "YOUR_REGION" -b "YOUR_BUCKET_NAME/DIR_TO_SYNC" -a "YOUR_ACCESS_KEY_ID" -s "YOUR_SECRET_ACCESS_KEY"
```

### Command Line Arguments

- rootOfLocal
  - alias: l
  - local directory to scan files. requires absolute path.
- exclude
  - alias: e
  - regex pattern of path to exclude.
  - default value is "", equals to ".+"
- region
  - alias: r
  - region name of your bucket.
- bucket
  - alias: b
  - name of your bucket.
  - you can specify directory to sync (just below bucket root) with following pattern: `BUCKETNAME/DIRECTORY_TO_SYNC`
- accessKeyId
  - alias: a
  - your accessKeyId.
- secretAccessKey
  - alias: s
  - your secretAccessKey.
- onlyListing
  - if specified, does not upload any files. only shows list of files to upload. (diff between local and S3)
  - default value is false

## Use as a library

import `src/sync.ts` to your project.

## Compile TypeScript sources to JS

```sh
# generate dist/index.js
npx tsc
```

## Run test

```sh
npx ts-node test/test.ts -l "dummy_will_be_overwritten" -e "" -r "YOUR_REGION" -b "dummy_will_be_overwritten" -a "YOUR_ACCESS_KEY_ID" -s "YOUR_SECRET_ACCESS_KEY"
```
