/**
 * This is a TypeScript version of the `get-stdin` npm package
 *
 * @format
 */

const stdin = process.stdin

const getStdin = (): Promise<string> => {
  let ret : string = ''

  return new Promise(resolve => {
    if (stdin.isTTY) {
      resolve(ret)
      return
    }

    stdin.setEncoding('utf8')
    stdin.on('readable', () => {
      let chunk

      // tslint:disable
      while ((chunk = stdin.read())) {
        ret += chunk
      }
      // tslint:enable
    })
    stdin.on('end', () => {
      resolve(ret)
    })
  })
}

export {getStdin}
