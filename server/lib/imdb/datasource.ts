import { createWriteStream, mkdirSync, createReadStream } from "fs"
import Axios from "axios"
import { Readable } from "stream"
import { Observable, concat, Subject, combineLatest } from "rxjs"
import { createInterface } from "readline"
import { createGunzip } from "zlib"
import { take, map, withLatestFrom, skip, filter, finalize } from "rxjs/operators"
import _ from "lodash"

export const sources = {
  names: "https://datasets.imdbws.com/name.basics.tsv.gz",
  akas: "https://datasets.imdbws.com/title.akas.tsv.gz",
  basics: "https://datasets.imdbws.com/title.basics.tsv.gz",
  crew: "https://datasets.imdbws.com/title.crew.tsv.gz",
  episode: "https://datasets.imdbws.com/title.episode.tsv.gz",
  principals: "https://datasets.imdbws.com/title.principals.tsv.gz",
  ratings: "https://datasets.imdbws.com/title.ratings.tsv.gz",
}

export const downloadFile = async (url: string) => {
  const filename = url.split("/").pop()
  const folder = "/tmp/imdb/download/"
  const fullname = folder + filename
  mkdirSync(folder, { recursive: true })

  return new Promise<string>((getResolve, getReject) => {
    Axios.get(url, { responseType: "stream" }).then(async (response) => {
      if (response.headers["content-type"] !== "binary/octet-stream") {
        getReject(new Error("Invalid Resource"))
      }

      await new Promise<void>((writeResolve) => {
        Readable.from(response.data)
          .pipe(createWriteStream(fullname))
          .on("finish", () => writeResolve())
      })
      getResolve(fullname)
    })
  })
}

export interface DataLine {
  [name: string]: string
}

export const createDataStream = (path: string) => {
  const readerInput = new Subject<string>()
  const readerInput$ = readerInput.pipe(map((line) => line.split("\t")))
  const header$ = readerInput$.pipe(take(1))
  const record$ = readerInput$.pipe(
    skip(1),
    withLatestFrom(header$),
    map((data) => {
      const keys = data[1]
      const fields = data[0]
      const lineData: DataLine = {}
      for (var i = 0; i < keys.length; i++) {
        lineData[keys[i]] = fields[i]
      }
      return lineData as Record<string, string>
    })
  )

  const fileReader = createInterface(createReadStream(path).pipe(createGunzip()))
  fileReader.on("line", (line) => readerInput.next(line))
  fileReader.on("close", () => readerInput.complete())

  return record$.pipe(
    finalize(() => {
      fileReader.close()
    })
  )
}

export interface TitleBasic {
  tconst: string
  titleType: string
  primaryTitle: string
  isAdult: boolean
  startYear?: number
  endYear?: number
  runtimeMinutes?: number
  genres: string[]
}

export const createTitleBasicStream = (path: string) =>
  createDataStream(path).pipe(
    map<DataLine, TitleBasic>((dataLine) => ({
      tconst: dataLine.tconst,
      titleType: dataLine.titleType,
      primaryTitle: dataLine.primaryTitle,
      isAdult: dataLine.isAdult === "1",
      startYear: dataLine.startYear === "\\N" ? undefined : parseInt(dataLine.startYear),
      endYear: dataLine.endYear === "\\N" ? undefined : parseInt(dataLine.endYear),
      runtimeMinutes:
        dataLine.runtimeMinutes === "\\N" ? undefined : parseInt(dataLine.runtimeMinutes),
      genres: dataLine.genres === "\\N" ? [] : [...dataLine.genres.split(",")],
    }))
  )

export interface TitleRating {
  tconst: string
  averageRating: number
  numVotes: number
}

export const createTitleRatingStream = (path: string) =>
  createDataStream(path).pipe(
    map<DataLine, TitleRating>((dataLine) => ({
      tconst: dataLine.tconst,
      averageRating: parseFloat(dataLine.averageRating),
      numVotes: parseFloat(dataLine.numVotes),
    }))
  )
