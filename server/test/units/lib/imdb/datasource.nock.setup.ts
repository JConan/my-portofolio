import nock from "nock";
import * as IMDB from "@:lib/imdb/datasource";
import { Readable } from "stream";
import { createGzip, createGunzip } from "zlib";
import { mkdir, mkdirSync, fstat, createWriteStream } from "fs";

/**
 * Title Rating data with missing sequences
 */
const dataRating = [
  ["tconst", "averageRating", "numVotes"].join("\t"),
  ["tt0000001", "5.6", "1642"].join("\t"),
  ["tt0000004", "6.2", "120"].join("\t"),
  ["tt0000005", "6.1", "2118"].join("\t"),
  null,
].join("\n");

const dataToGzFile = (filename: string, data: string) => {
  return new Promise<string>((resolve) => {
    const folder = "/tmp/imdb/nock-data/";
    const fullname = folder + filename;
    mkdirSync(folder, { recursive: true });
    Readable.from(data)
      .pipe(createGzip())
      .pipe(createWriteStream(fullname))
      .on("close", () => resolve(fullname));
  });
};

const setup = async () => {
  const ratingFile = await dataToGzFile("title.ratings.tsv.gz", dataRating);

  nock("https://datasets.imdbws.com")
    .defaultReplyHeaders({
      "content-type": "binary/octet-stream",
    })
    // Title Rating
    .get("/title.ratings.tsv.gz")
    .replyWithFile(200, ratingFile);

  nock("https://datasets.imdbws.com")
    // default response
    .filteringPath((path) => "/")
    .get("/")
    .reply(200, "Resource not found");
};

export default setup;
