import * as IMDB from "@:lib/imdb/datasource";
import nockSetup from "./datasource.nock.setup";
import { createReadStream } from "fs";
import { createGunzip } from "zlib";
import { createInterface } from "readline";
import { bufferCount } from "rxjs/operators";

describe("download data in /tmp/imdb/download", () => {
  beforeAll(async () => await nockSetup());

  it("should be able to fetch & stream rating data", async () => {
    expect.assertions(3);
    const file = await IMDB.downloadFile(IMDB.sources.ratings);

    const dataLines = await new Promise<Array<string>>((resolve) => {
      const lines: Array<string> = [];
      createInterface(createReadStream(file).pipe(createGunzip()))
        .on("line", (line) => lines.push(line))
        .on("close", () => resolve(lines));
    });
    expect(file).toBe("/tmp/imdb/download/title.ratings.tsv.gz");
    expect(dataLines).toHaveLength(4);

    const data$ = await IMDB.streamDataFile(file);

    const datas = await data$.pipe(bufferCount(10)).toPromise();
    expect(datas).toHaveLength(3);
  });

  it("should be able to failed on 404 not found resource", async () => {
    expect.assertions(1);
    try {
      await IMDB.downloadFile(IMDB.sources.ratings + "Invalid");
    } catch (ex) {
      expect(ex.message).toBe("Invalid Resource");
    }
  });
});
