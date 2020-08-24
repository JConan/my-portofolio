import { createWriteStream, mkdirSync, createReadStream } from "fs"
import Axios from "axios"
import { Readable } from "stream"
import { Observable, concat } from "rxjs"
import { createInterface } from "readline"
import { createGunzip } from "zlib"
import { take, map, withLatestFrom, skip, filter } from "rxjs/operators"
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

const pipeToStreamData = (stream$: Observable<string>): Observable<DataLine> => {
  const streamHeader$ = stream$.pipe(
    take(1),
    map((line) => line.split("\t"))
  )
  const streamData$ = stream$.pipe(
    skip(1),
    map((line) => line.split("\t")),
    withLatestFrom(streamHeader$),
    map((data) => {
      const keys = data[1]
      const fields = data[0]
      const lineData: DataLine = {}
      for (var i = 0; i < keys.length; i++) {
        lineData[keys[i]] = fields[i]
      }
      return lineData
    })
  )

  return streamData$
}

export const createDataStream = (path: string) => {
  const stream$ = new Observable<string>((observer) => {
    const lineReader = createInterface(createReadStream(path).pipe(createGunzip()))
    lineReader.on("line", (line) => observer.next(line))
    lineReader.on("close", () => observer.complete())
    observer.add(() => lineReader.close())
  })
  return pipeToStreamData(stream$)
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
