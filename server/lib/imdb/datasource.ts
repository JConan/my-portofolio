import { createWriteStream, mkdirSync, createReadStream } from "fs"
import Axios from "axios"
import { Readable } from "stream"
import { Subject, Observable, NEVER } from "rxjs"
import { createInterface } from "readline"
import { createGunzip } from "zlib"
import {
  take,
  map,
  withLatestFrom,
  skip,
  flatMap,
  distinct,
  bufferWhen,
  scan,
} from "rxjs/operators"
import { GenreModelType, MovieModelType, IGenre } from "@:api.vidly/models"

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

export type DataLine<T = string> = Record<T extends string ? string : keyof T, string>

export const createDataStream = (path: string) =>
  new Observable<DataLine>((observer) => {
    const readerInput = new Subject<string>()
    const readerInput$ = readerInput.pipe(map((line) => line.split("\t")))
    const header$ = readerInput$.pipe(take(1))
    const record$ = readerInput$.pipe(
      skip(1),
      withLatestFrom(header$),
      map((data) => {
        const keys = data[1]
        const fields = data[0]
        return fields.reduce((rows, value, index) => {
          rows[keys[index]] = value
          return rows
        }, {} as DataLine)
      })
    )

    const fileReader = createInterface(createReadStream(path).pipe(createGunzip()))
    fileReader.on("line", (line) => readerInput.next(line))
    fileReader.on("close", () => readerInput.complete())

    observer.add(() => fileReader.close())
    record$.subscribe({
      next: (data) => observer.next(data),
      complete: () => observer.complete(),
    })
  })

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
    map(
      (dataLine: DataLine<TitleBasic>): TitleBasic => ({
        tconst: dataLine.tconst,
        titleType: dataLine.titleType,
        primaryTitle: dataLine.primaryTitle,
        isAdult: dataLine.isAdult === "1",
        startYear: dataLine.startYear === "\\N" ? undefined : parseInt(dataLine.startYear),
        endYear: dataLine.endYear === "\\N" ? undefined : parseInt(dataLine.endYear),
        runtimeMinutes:
          dataLine.runtimeMinutes === "\\N" ? undefined : parseInt(dataLine.runtimeMinutes),
        genres: dataLine.genres === "\\N" ? [] : [...dataLine.genres.split(",")],
      })
    )
  )

export interface TitleRating {
  tconst: string
  averageRating: number
  numVotes: number
}

export const createTitleRatingStream = (path: string) =>
  createDataStream(path).pipe(
    map<DataLine<TitleRating>, TitleRating>((dataLine) => ({
      tconst: dataLine.tconst,
      averageRating: parseFloat(dataLine.averageRating),
      numVotes: parseFloat(dataLine.numVotes),
    }))
  )

export const importGenres = (genreModel: GenreModelType, basic$: Observable<TitleBasic>) => {
  return new Promise<Array<IGenre & { _id: string }>>(async (resolve) => {
    const genreNames = await basic$
      .pipe(
        map((basic) => basic.genres),
        flatMap((x) => x),
        distinct(),
        bufferWhen(() => NEVER)
      )
      .toPromise()

    const bulkDatas = genreNames.map((name) => ({ insertOne: { document: { name } } }))

    genreModel.bulkWrite(bulkDatas).then(({ insertedIds }) => {
      const genreDatas = genreNames.reduce((allData, genreName, idx) => {
        allData.push({ name: genreName, _id: String(insertedIds[idx]) })
        return allData
      }, new Array<IGenre & { _id: string }>())

      resolve(genreDatas)
    })
  })
}

export const importMovieDatas = (
  movieModel: MovieModelType,
  genreDoc: Array<IGenre & { _id: string }>,
  basic$: Observable<TitleBasic[]>
) => {
  return new Promise<{ insertedCount: number }>(async (resolve) => {
    const result = await basic$
      .pipe(
        map((titles) =>
          titles.map((title) => ({
            tconst: title.tconst,
            title: title.primaryTitle,
            year: title.startYear,
            duration: title.runtimeMinutes,
            genres: title.genres.map((genre) => genreDoc.find((doc) => doc.name === genre)),
          }))
        ),
        map((movies) =>
          movieModel.bulkWrite(movies.map((movie) => ({ insertOne: { document: movie } })))
        ),
        flatMap((x) => x),
        scan(
          (allResult, current) => ({
            insertedCount: allResult.insertedCount + current.insertedCount!,
          }),
          { insertedCount: 0 } as { insertedCount: number }
        )
      )
      .toPromise()
    resolve(result)
  })
}

export const importMovieRatingDatas = (
  movieModel: MovieModelType,
  rating$: Observable<TitleRating[]>
) => {
  return new Promise<{ modifiedCount: number }>(async (resolve) => {
    const result = await rating$
      .pipe(
        map((ratings) =>
          ratings.map((rating) => ({
            tconst: rating.tconst,
            averageRate: rating.averageRating,
            totalVotes: rating.numVotes,
          }))
        ),
        map((ratings) =>
          movieModel.bulkWrite(
            ratings.map((rating) => {
              const { tconst, ...scores } = rating
              return { updateOne: { filter: { tconst }, update: scores, hint: "tconst_1" } }
            })
          )
        ),
        flatMap((x) => x),
        scan(
          (allResult, current) => ({
            modifiedCount: allResult.modifiedCount + current.modifiedCount!,
          }),
          { modifiedCount: 0 } as { modifiedCount: number }
        )
      )
      .toPromise()

    resolve(result)
  })
}
