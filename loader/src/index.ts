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

import * as buble from 'buble'
import {getOptions} from 'loader-utils'
import * as TSInterfaceBuilder from 'ts-interface-builder'

export default function(_: any, map: any) {
  const {compile} = TSInterfaceBuilder.Compiler

  // @ts-ignore
  let compiledJs: string = compile(this.resourcePath, getOptions(this) || {})

  // ts-interface-builder generates a mostly-JS output, which Webpack
  // doesn't play friendly with. This line below will remove the TypeScript
  // bindings that we don't need.
  compiledJs = compiledJs.replace(/\: t\.ITypeSuite /gi, '')

  // Pass the output through a ES5 JS compiler to get the consts and object notation out
  compiledJs = buble.transform(compiledJs, {
    transforms: {
      modules: false,
    },
  }).code

  // @ts-ignore
  this.callback(null, compiledJs, map)
}
