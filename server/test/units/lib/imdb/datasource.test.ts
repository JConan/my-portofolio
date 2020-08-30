import * as IMDB from "@:lib/imdb/datasource"
import nockSetup from "./datasource.nock.setup"
import { bufferCount, bufferWhen } from "rxjs/operators"
import { NEVER } from "rxjs"
import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import { GenreModel, initializeModels, MovieModel } from "@:api.vidly/models"

describe("download & import IMDB data", () => {
  beforeAll(async () => await nockSetup())
  var basicFilePath: string
  var ratingFilePath: string

  describe("download file from IMDB", () => {
    it("should be able to failed on 404 not found resource", async () => {
      expect.assertions(1)
      try {
        await IMDB.downloadFile(IMDB.sources.ratings + "Invalid")
      } catch (ex) {
        expect(ex.message).toBe("Invalid Resource")
      }
    })

    it("should be able to download title basics data", async () => {
      expect.assertions(1)
      basicFilePath = await IMDB.downloadFile(IMDB.sources.basics)
      expect(basicFilePath).toEqual("/tmp/imdb/download/title.basics.tsv.gz")
    })

    it("should be able to download title rating data", async () => {
      expect.assertions(1)
      ratingFilePath = await IMDB.downloadFile(IMDB.sources.ratings)
      expect(ratingFilePath).toEqual("/tmp/imdb/download/title.ratings.tsv.gz")
    })
  })

  describe("parsing data from IMDB", () => {
    it("should be able parse title basics data", async () => {
      expect.assertions(1)
      const data$ = IMDB.createTitleBasicStream(basicFilePath)
      const datas = await data$.pipe(bufferWhen(() => NEVER)).toPromise()
      expect(datas).toMatchInlineSnapshot(`
        Array [
          Object {
            "endYear": undefined,
            "genres": Array [
              "Documentary",
              "Short",
            ],
            "isAdult": false,
            "primaryTitle": "Carmencita",
            "runtimeMinutes": 1,
            "startYear": undefined,
            "tconst": "tt0000001",
            "titleType": "short",
          },
          Object {
            "endYear": undefined,
            "genres": Array [
              "Animation",
              "Short",
            ],
            "isAdult": false,
            "primaryTitle": "Le clown et ses chiens",
            "runtimeMinutes": 5,
            "startYear": 1892,
            "tconst": "tt0000002",
            "titleType": "short",
          },
          Object {
            "endYear": 1892,
            "genres": Array [
              "Animation",
              "Comedy",
              "Romance",
            ],
            "isAdult": false,
            "primaryTitle": "Pauvre Pierrot",
            "runtimeMinutes": 4,
            "startYear": 1892,
            "tconst": "tt0000003",
            "titleType": "short",
          },
          Object {
            "endYear": undefined,
            "genres": Array [
              "Animation",
              "Short",
            ],
            "isAdult": false,
            "primaryTitle": "Un bon bock",
            "runtimeMinutes": 12,
            "startYear": 1892,
            "tconst": "tt0000004",
            "titleType": "short",
          },
          Object {
            "endYear": undefined,
            "genres": Array [
              "Comedy",
              "Short",
            ],
            "isAdult": false,
            "primaryTitle": "Blacksmith Scene",
            "runtimeMinutes": 1,
            "startYear": 1893,
            "tconst": "tt0000005",
            "titleType": "short",
          },
          Object {
            "endYear": undefined,
            "genres": Array [
              "Short",
            ],
            "isAdult": false,
            "primaryTitle": "Chinese Opium Den",
            "runtimeMinutes": 1,
            "startYear": 1894,
            "tconst": "tt0000006",
            "titleType": "short",
          },
          Object {
            "endYear": undefined,
            "genres": Array [
              "Short",
              "Sport",
            ],
            "isAdult": false,
            "primaryTitle": "Corbett and Courtney Before the Kinetograph",
            "runtimeMinutes": 1,
            "startYear": 1894,
            "tconst": "tt0000007",
            "titleType": "short",
          },
          Object {
            "endYear": undefined,
            "genres": Array [
              "Documentary",
              "Short",
            ],
            "isAdult": false,
            "primaryTitle": "Edison Kinetoscopic Record of a Sneeze",
            "runtimeMinutes": undefined,
            "startYear": 1894,
            "tconst": "tt0000008",
            "titleType": "short",
          },
          Object {
            "endYear": undefined,
            "genres": Array [],
            "isAdult": false,
            "primaryTitle": "Miss Jerry",
            "runtimeMinutes": 45,
            "startYear": 1894,
            "tconst": "tt0000009",
            "titleType": "movie",
          },
        ]
      `)
    })
    it("should be able parse title ratings data", async () => {
      expect.assertions(1)
      const data$ = IMDB.createTitleRatingStream(ratingFilePath)
      const datas = await data$.pipe(bufferWhen(() => NEVER)).toPromise()
      expect(datas).toMatchInlineSnapshot(`
        Array [
          Object {
            "averageRating": 6.1,
            "numVotes": 198,
            "tconst": "tt0000002",
          },
          Object {
            "averageRating": 6.2,
            "numVotes": 120,
            "tconst": "tt0000004",
          },
          Object {
            "averageRating": 6.1,
            "numVotes": 2118,
            "tconst": "tt0000005",
          },
          Object {
            "averageRating": 5.5,
            "numVotes": 650,
            "tconst": "tt0000007",
          },
        ]
      `)
    })
  })

  describe("Import data from IMDB", () => {
    const server = MongoMemoryServer.create()
    beforeAll(async () => {
      const connection = mongoose.createConnection(await (await server).getUri(), {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      initializeModels(connection)
    })

    it("should be able to import GenreData", async () => {
      expect.assertions(3)
      const genreModel = GenreModel()
      const result = await IMDB.importGenres(genreModel, IMDB.createTitleBasicStream(basicFilePath))
      expect(result.map((genreData) => genreData.name)).toEqual([
        "Documentary",
        "Short",
        "Animation",
        "Comedy",
        "Romance",
        "Sport",
      ])
      const ids = result.map((genreData) => genreData._id.length > 0)
      expect(ids).toHaveLength(6)
      expect(ids.every((value) => value === true)).toBe(true)
    })

    it("should be able to import BasicData", async () => {
      expect.assertions(1)
      const listOfGenres = ["Documentary", "Short", "Animation", "Comedy", "Romance", "Sport"]
      const genreDocs = await GenreModel()
        .find({ name: { $in: listOfGenres } })
        .exec()

      const movieModel = MovieModel()
      const result = await IMDB.importMovieDatas(
        movieModel,
        genreDocs,
        IMDB.createTitleBasicStream(basicFilePath).pipe(bufferCount(3))
      )
      expect(result.insertedCount).toEqual(9)
    })

    it("should be able to import RatingData", async () => {
      expect.assertions(1)
      const movieModel = MovieModel()
      const result = await IMDB.importMovieRatingDatas(
        movieModel,
        IMDB.createTitleRatingStream(ratingFilePath).pipe(bufferCount(3))
      )
      expect(result.modifiedCount).toEqual(4)
    })
  })
})
