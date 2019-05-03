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

// Create stubs
jest.spyOn(console, 'log').mockImplementation(message => message)
jest.spyOn(console, 'error').mockImplementation(message => message)
jest.spyOn(process, 'exit').mockImplementation(code => code)
jest.spyOn(JSON, 'stringify').mockImplementation(string => string)

// Extend 'require' to support fixtures
const path = require('path')
const fs = require('fs')
require.requireFixture = fixture => fs.readFileSync(path.resolve(__dirname, './__fixtures__', fixture), 'utf8')

// Mock getStdin
jest.mock('./get-stdin', () => ({
  getStdin: jest.fn(() => Promise.resolve('{}')),
}))
const {getStdin} = require('./get-stdin')

// Helper
const unstub = stub => stub.mock.calls[0][0]

// Load our CLI
const {main, typesTI} = require('./index')

describe('ts-interface-builder', () => {
  afterEach(() =>
    [console.log, console.error, JSON.stringify, process.exit].forEach(fn => {
      fn.mockClear()
    }),
  )

  describe('Export types.ts as JSON', () => {
    it('matches the JSON payload of typesTI', async () => {
      await main()

      expect(unstub(console.log).manifestJson).toEqual(typesTI)
      expect(process.exit).toBeCalledWith(0)
    })
  })

  describe('Runtime typecheck with types.ts', () => {
    it('returns an error from bad JSON', async () => {
      getStdin.mockImplementationOnce(() => Promise.resolve('{]()'))

      await main()

      expect(unstub(console.error)).toMatchInlineSnapshot(`"Unexpected token ] in JSON at position 1"`)
      expect(process.exit).toBeCalledWith(0)
    })

    it('returns an error from an empty JSON', async () => {
      getStdin.mockImplementationOnce(() => Promise.resolve())

      await main()

      expect(unstub(console.error)).toMatchInlineSnapshot(`
"You cannot call \\"yarn run --silent cli\\" directly. You must pipe it in with a valid JSON string.
For example:
  $ echo '{\\"key\\": \\"value\\"}' | yarn run --silent cli
  $ echo '{\\"key\\": \\"value\\"}' | yarn run --silent cli | jq '.'
  $ cat src/__fixtures__/ok-all-matching-types.json | yarn run --silent cli
  $ cat src/__fixtures__/ok-all-matching-types.json | yarn run --silent cli | jq '.'"
`)
      expect(process.exit).toBeCalledWith(0)
    })

    it('returns an error from an JSON with a missing tvShows key', async () => {
      const fixture = require.requireFixture('error-no-tvshows-key.json')
      getStdin.mockImplementationOnce(() => Promise.resolve(fixture))

      await main()

      expect(unstub(console.log).manifestValidator.message).toMatchInlineSnapshot(`"value.tvShows is missing"`)
      expect(unstub(console.log).manifestStrictValidator.message).toMatchInlineSnapshot(`"value.tvShows is missing"`)
      expect(process.exit).toBeCalledWith(0)
    })

    it('returns an error from an JSON with a mistyped film key', async () => {
      const fixture = require.requireFixture('error-non-existent-films-key.json')
      getStdin.mockImplementationOnce(() => Promise.resolve(fixture))

      await main()

      expect(unstub(console.log).manifestValidator.message).toMatchInlineSnapshot(
        `"value.films[0] is not a IFilm; value.films[0].name is missing"`,
      )
      expect(unstub(console.log).manifestStrictValidator.message).toMatchInlineSnapshot(
        `"value.films[0] is not a IFilm; value.films[0].name is missing"`,
      )
      expect(process.exit).toBeCalledWith(0)
    })

    it('returns an error from an JSON with a mistyped film country key', async () => {
      const fixture = require.requireFixture('error-non-existent-film-country-key.json')
      getStdin.mockImplementationOnce(() => Promise.resolve(fixture))

      await main()

      expect(unstub(console.log).manifestValidator.message).toMatchInlineSnapshot(`"value.tvShows is missing"`)
      expect(unstub(console.log).manifestStrictValidator.message).toMatchInlineSnapshot(
        `"value.films[0] is not a IFilm; value.films[0].countries[0] is not a ICountry; value.films[0].countries[0].countryLocalNameErrorKey is extraneous"`,
      )
      expect(process.exit).toBeCalledWith(0)
    })

    it('returns an error from an JSON with a missing film optional country key', async () => {
      const fixture = require.requireFixture('error-no-film-country-optional-key.json')
      getStdin.mockImplementationOnce(() => Promise.resolve(fixture))

      await main()

      expect(unstub(console.log).manifestValidator.message).toMatchInlineSnapshot(`"value.tvShows is missing"`)
      expect(unstub(console.log).manifestStrictValidator.message).toMatchInlineSnapshot(`"value.tvShows is missing"`)
      expect(process.exit).toBeCalledWith(0)
    })

    it('returns an error from an JSON with a film country key with wrong type', async () => {
      const fixture = require.requireFixture('error-wrong-type-film-country-key.json')
      getStdin.mockImplementationOnce(() => Promise.resolve(fixture))

      await main()

      expect(unstub(console.log).manifestValidator.message).toMatchInlineSnapshot(
        `"value.films[0] is not a IFilm; value.films[0].countries[0] is not a ICountry; value.films[0].countries[0].countryInternationalName is not a string"`,
      )
      expect(unstub(console.log).manifestStrictValidator.message).toMatchInlineSnapshot(
        `"value.films[0] is not a IFilm; value.films[0].countries[0] is not a ICountry; value.films[0].countries[0].countryInternationalName is not a string"`,
      )
    })

    it('returns OK from an JSON with keys and empty arrays', async () => {
      const fixture = require.requireFixture('ok-keys-empty-arrays.json')
      getStdin.mockImplementationOnce(() => Promise.resolve(fixture))

      await main()

      expect(unstub(console.log).manifestValidator.status).toEqual('OK')
      expect(unstub(console.log).manifestStrictValidator.status).toEqual('OK')
      expect(process.exit).toBeCalledWith(0)
    })

    it('returns OK with a JSON with all matching types', async () => {
      const fixture = require.requireFixture('ok-all-matching-types.json')
      getStdin.mockImplementationOnce(() => Promise.resolve(fixture))

      await main()

      expect(unstub(console.log).manifestValidator.status).toEqual('OK')
      expect(unstub(console.log).manifestStrictValidator.status).toEqual('OK')
      expect(process.exit).toBeCalledWith(0)
    })
  })
})
