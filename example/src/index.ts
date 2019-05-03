/**
 * Copyright (c) 2019-Present, Spotify AB.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * @format
 */

// This allows us to pipe in JSON through the command line.
// @ts-ignore
import {getStdin} from './get-stdin'

// This takes our types, and using ts-interface-loader, generates the JSON manifest on-the-fly.
// We can then use this to do runtime client matching with the package "ts-interface-checker" (see below)
//
// Note: Unfortunately, we have to use @ts-ignore and tslint:disable-line for now. Webpack Loaders don't play nice.
// @ts-ignore
import typesTI from 'ts-interface-loader!./types' // tslint:disable-line
import * as types from './types'

// This is the dependency we use to check TypeScript types at runtime.
import {createCheckers, ITypeSuite} from 'ts-interface-checker'

// Let's translate our manifest into JSON.
class Manifest {
  public manifest: object
  constructor(manifest: object) {
    this.manifest = manifest
  }

  public toObject(): object {
    return this.manifest
  }
}

// Let's create a simple manifest validator
interface IManifestValidatorResponse {
  status: 'OK' | 'error'
  message?: string
}

class ManifestValidator {
  public manifest: ITypeSuite
  public typeName: string
  constructor(manifest: ITypeSuite, typeName: string) {
    this.manifest = manifest
    this.typeName = typeName
  }

  public check(jsonObject: object): IManifestValidatorResponse {
    const checkers = createCheckers(this.manifest)
    const checker = checkers[this.typeName]

    // Validate an arbitrary JSON / JavaScript object
    // against our ISpec TypeScript definition.
    try {
      checker.check(jsonObject)
      return {status: 'OK'}
    } catch (err) {
      return {
        message: err.message,
        status: 'error',
      }
    }
  }

  public strictCheck(jsonObject: object): IManifestValidatorResponse {
    const checkers = createCheckers(this.manifest)
    const checker = checkers[this.typeName]

    // Validate an arbitrary JSON / JavaScript object
    // against our ISpec TypeScript definition.
    try {
      checker.strictCheck(jsonObject)
      return {status: 'OK'}
    } catch (err) {
      return {
        message: err.message,
        status: 'error',
      }
    }
  }
}

// Let's run our code
async function main() {
  try {
    const stdin: string = await getStdin()

    if (!stdin) {
      throw new Error(
        [
          'You cannot call "yarn run --silent cli" directly. You must pipe it in with a valid JSON string.',
          'For example:',
          '  $ echo \'{"key": "value"}\' | yarn run --silent cli',
          '  $ echo \'{"key": "value"}\' | yarn run --silent cli | jq \'.\'',
          '  $ cat src/__fixtures__/ok-all-matching-types.json | yarn run --silent cli',
          "  $ cat src/__fixtures__/ok-all-matching-types.json | yarn run --silent cli | jq '.'",
        ].join('\n'),
      )
    }

    const jsonStdin = JSON.parse(stdin)

    console.log(
      JSON.stringify({
        manifestJson: new Manifest(typesTI).toObject(),
        manifestStrictValidator: new ManifestValidator(typesTI, 'ISpec').strictCheck(jsonStdin),
        manifestValidator: new ManifestValidator(typesTI, 'ISpec').check(jsonStdin),
      }),
    )
  } catch (err) {
    console.error(err.message)
  } finally {
    process.exit(0)
  }
}

if (process.env.NODE_ENV !== 'test') {
  main()
}

// Export so we can test it using Jest.
export {main, typesTI}
