import { createWriteStream, mkdirSync, createReadStream } from "fs";
import Axios from "axios";
import { Readable } from "stream";
import { Observable } from "rxjs";
import { createInterface } from "readline";
import { createGunzip } from "zlib";
import { take, map, withLatestFrom, skip } from "rxjs/operators";

export const sources = {
  names: "https://datasets.imdbws.com/name.basics.tsv.gz",
  akas: "https://datasets.imdbws.com/title.akas.tsv.gz",
  basics: "https://datasets.imdbws.com/title.basics.tsv.gz",
  crew: "https://datasets.imdbws.com/title.crew.tsv.gz",
  episode: "https://datasets.imdbws.com/title.episode.tsv.gz",
  principals: "https://datasets.imdbws.com/title.principals.tsv.gz",
  ratings: "https://datasets.imdbws.com/title.ratings.tsv.gz",
};

export const downloadFile = async (url: string) => {
  const filename = url.split("/").pop();
  const folder = "/tmp/imdb/download/";
  const fullname = folder + filename;
  mkdirSync(folder, { recursive: true });

  return new Promise<string>((getResolve, getReject) => {
    Axios.get(url, { responseType: "stream" }).then(async (response) => {
      if (response.headers["content-type"] !== "binary/octet-stream") {
        getReject(new Error("Invalid Resource"));
      }

      await new Promise<void>((writeResolve, writeReject) => {
        Readable.from(response.data)
          .pipe(createWriteStream(fullname))
          .on("finish", () => writeResolve());
      });
      getResolve(fullname);
    });
  });
};

interface ImdbDataLine {
  [name: string]: string;
}

export const streamDataFile = (path: string) => {
  const stream$ = new Observable<string>((observer) => {
    const lineReader = createInterface(
      createReadStream(path).pipe(createGunzip())
    );
    lineReader.on("line", (line) => observer.next(line));
    lineReader.on("close", () => observer.complete());
    observer.add(() => lineReader.close());
  });

  const streamHeader$ = stream$.pipe(
    take(1),
    map((line) => line.split("\t"))
  );
  const streamData$ = stream$.pipe(
    skip(1),
    map((line) => line.split("\t")),
    withLatestFrom(streamHeader$),
    map((data) => {
      const keys = data[1];
      const fields = data[0];
      const lineData: ImdbDataLine = {};
      for (var i = 0; i < keys.length; i++) {
        lineData[keys[i]] = fields[i];
      }
      return lineData;
    })
  );
  return streamData$;
};
