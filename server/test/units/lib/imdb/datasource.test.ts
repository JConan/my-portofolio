import * as IMDB from "@:lib/imdb/datasource"
import nockSetup from "./datasource.nock.setup"
import { bufferCount, take } from "rxjs/operators"

describe("download & parse IMDB data", () => {
  beforeAll(async () => await nockSetup())

  it("should be able to failed on 404 not found resource", async () => {
    expect.assertions(1)
    try {
      await IMDB.downloadFile(IMDB.sources.ratings + "Invalid")
    } catch (ex) {
      expect(ex.message).toBe("Invalid Resource")
    }
  })

  it("should be able to fetch title basics data", async () => {
    expect.assertions(1)
    const file = await IMDB.downloadFile(IMDB.sources.basics)
    const data$ = IMDB.createTitleBasicStream(file)
    const datas = await data$.pipe(bufferCount(10), take(1)).toPromise()
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

  it("should be able to fetch title rating data", async () => {
    expect.assertions(1)
    const file = await IMDB.downloadFile(IMDB.sources.ratings)
    const data$ = IMDB.createTitleRatingStream(file)
    const datas = await data$.pipe(bufferCount(10), take(1)).toPromise()
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
