import nock from "nock"
import { Readable } from "stream"
import { createGzip } from "zlib"
import { mkdirSync, createWriteStream } from "fs"

const dataFormat = (data: string) => {
  const multispace = / {2,}/g
  return multispace[Symbol.split](data).join("\t").split("\n").slice(1).join("\n")
}

/**
 * Title Basics
 */
const dataBasics = dataFormat(
  `
tconst     titleType  primaryTitle                                 originalTitle                                isAdult  startYear  endYear  runtimeMinutes  genres
tt0000001  short      Carmencita                                   Carmencita                                   0        \\N        \\N      1               Documentary,Short
tt0000002  short      Le clown et ses chiens                       Le clown et ses chiens                       0        1892       \\N      5               Animation,Short
tt0000003  short      Pauvre Pierrot                               Pauvre Pierrot                               0        1892       1892     4               Animation,Comedy,Romance
tt0000004  short      Un bon bock                                  Un bon bock                                  0        1892       \\N      12              Animation,Short
tt0000005  short      Blacksmith Scene                             Blacksmith Scene                             0        1893       \\N      1               Comedy,Short
tt0000006  short      Chinese Opium Den                            Chinese Opium Den                            0        1894       \\N      1               Short
tt0000007  short      Corbett and Courtney Before the Kinetograph  Corbett and Courtney Before the Kinetograph  0        1894       \\N      1               Short,Sport
tt0000008  short      Edison Kinetoscopic Record of a Sneeze       Edison Kinetoscopic Record of a Sneeze       0        1894       \\N      \\N             Documentary,Short
tt0000009  movie      Miss Jerry                                   Miss Jerry                                   0        1894       \\N      45              \\N
`
)

/**
 * Title Rating data with missing sequences
 */
const dataRatings = dataFormat(`
tconst     averageRating  numVotes
tt0000002  6.1            198
tt0000004  6.2            120
tt0000005  6.1            2118
tt0000007  5.5            650
`)

const dataToGzFile = (filename: string, data: string) => {
  return new Promise<string>((resolve) => {
    const folder = "/tmp/imdb/nock-data/"
    const fullname = folder + filename
    mkdirSync(folder, { recursive: true })
    Readable.from(data)
      .pipe(createGzip())
      .pipe(createWriteStream(fullname))
      .on("close", () => resolve(fullname))
  })
}

const setup = async () => {
  const basicsFile = await dataToGzFile("title.basics.tsv.gz", dataBasics)
  const ratingFile = await dataToGzFile("title.ratings.tsv.gz", dataRatings)

  nock("https://datasets.imdbws.com")
    .defaultReplyHeaders({
      "content-type": "binary/octet-stream",
    })
    // Title Basics
    .get("/title.basics.tsv.gz")
    .replyWithFile(200, basicsFile)

    // Title Rating
    .get("/title.ratings.tsv.gz")
    .times(2)
    .replyWithFile(200, ratingFile)

  nock("https://datasets.imdbws.com")
    // default response
    .filteringPath(() => "/")
    .get("/")
    .reply(200, "Resource not found")
}

export default setup
