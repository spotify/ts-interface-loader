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

export interface ICountry {
  countryCode: string
  countryInternationalName: string
  countryLocalName?: string
}

/**
 * Full JSON spec.
 */
export interface ISpec {
  films: IFilm[]
  tvShows: ITelevisionShow[]
}

/**
 * One of the two types (the simple) we'll be using: IFilm.
 */

export interface IFilm {
  name: string
  countries: ICountry[]
}

/**
 * The second type (the advanced) we'll be using: ITelevisionShow.
 */

export interface ITelevisionShow {
  title: string
  countries: ICountry[]
  series: ISeries[]
}

export interface ISeries {
  seriesNumber: number
  year: number
  episodes: IEpisode[]
}

export interface IEpisode {
  episodeNumber: number
  date: string
  actors: IActor[]
}

export interface IActor {
  stageName: string
  realName: string
}
