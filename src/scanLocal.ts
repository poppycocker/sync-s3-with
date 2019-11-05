import fs, { promises as fsp } from 'fs'
import path from 'path'

async function scanLocal(
  cd: string,
  exclude: RegExp | null = null,
  result: string[] = []
): Promise<string[]> {
  const dirents: fs.Dirent[] = await fsp.readdir(cd, { withFileTypes: true })
  // files
  const filePaths = dirents
    .filter(dirent => !dirent.isDirectory())
    .filter(dirent => !exclude || !exclude.test(dirent.name))
    .map(dirent => path.join(cd, dirent.name))
  result.push(...filePaths)
  // subdirs
  const promises = dirents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .map(async basename => {
      const subdir = path.join(cd, basename)
      await scanLocal(subdir, exclude, result)
    })
  await Promise.all(promises)
  return result
}

export default scanLocal
