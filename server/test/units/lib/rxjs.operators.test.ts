import {
  zipAll,
  zipSequence,
  Sequence,
  setBuffer,
  SequencerBuffer,
} from "@:lib/rxjs.operators";
import { of } from "rxjs";

describe("custom rxjs operators", () => {
  describe("zipAll completed with the longuest observable", () => {
    const streamA$ = of(1, 2, 3, 4);
    const streamB$ = of(2, 3);

    it("should zip every stream completed on the longest one with 'undefined' as filler", (done) => {
      const results = [] as any[];
      zipAll(streamA$, streamB$).subscribe(
        (values) => results.push(values),
        null,
        () => {
          expect(results).toEqual(
            [
              [1, 2,],
              [2, 3,],
              [3, undefined,],
              [4, undefined,],
            ]
          );
          done();
        }
      );
    });
  });

  describe("Sequencer internal buffer", () => {
    interface DataTYpe {
      id: number;
      value: string;
    }
    const getId = (data: DataTYpe) => data.id;

    it("should resolve items of same sequence", () => {
      const dataIteration: Array<DataTYpe> = [
        { id: 1, value: "a" },
        { id: 1, value: "b" },
        { id: 1, value: "c" },
      ];

      const expectedResult: SequencerBuffer<DataTYpe> = {
        1: [
          { id: 1, value: "a" },
          { id: 1, value: "b" },
          { id: 1, value: "c" },
        ],
      };

      const result = setBuffer({}, getId, ...dataIteration);
      expect(result).toEqual(expectedResult);
    });

    it("should resolve items of different sequence", () => {
      const dataIteration: Array<DataTYpe> = [
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 1, value: "c" },
      ];

      const expectedResult: SequencerBuffer<DataTYpe> = {
        1: [{ id: 1, value: "a" }, undefined, { id: 1, value: "c" }],
        2: [undefined, { id: 2, value: "b" }, undefined],
      };

      const result = setBuffer({}, getId, ...dataIteration);
      expect(result).toEqual(expectedResult);
    });

    it("should resolve some undefined item", () => {
      const dataIteration: Array<DataTYpe | undefined> = [
        { id: 1, value: "a" },
        undefined,
        { id: 1, value: "c" },
      ];

      const expectedResult: SequencerBuffer<DataTYpe> = {
        1: [{ id: 1, value: "a" }, undefined, { id: 1, value: "c" }],
      };

      const result = setBuffer({}, getId, ...dataIteration);
      expect(result).toEqual(expectedResult);
    });

    it('should create array of undefined for any number of missing sequences', () => {
      const dataIteration: Array<DataTYpe | undefined> = [
        { id: 1, value: "a" }, { id: 3, value: "b" }, { id: 3, value: "c" },
      ];

      const expectedResult: SequencerBuffer<DataTYpe> = {
        1: [{ id: 1, value: "a" }, undefined, undefined],
        2: [undefined, undefined, undefined],
        3: [undefined, { id: 3, value: "b" }, { id: 3, value: "c" }],
      };

      const result = setBuffer({}, getId, ...dataIteration);
      expect(result).toEqual(expectedResult);
    })

    it("should merge previous buffer with new data", () => {
      const bufferState: SequencerBuffer<DataTYpe> = {
        1: [{ id: 1, value: "a" }, undefined, undefined],
        2: [undefined, { id: 2, value: "b" }, { id: 2, value: "c" }],
      };
      const dataIteration: Array<DataTYpe | undefined> = [
        { id: 2, value: "a" },
        { id: 3, value: "b" },
        { id: 4, value: "c" },
      ];

      const expectedResult: SequencerBuffer<DataTYpe> = {
        1: [{ id: 1, value: "a" }, undefined, undefined],
        2: [{ id: 2, value: "a" }, { id: 2, value: "b" }, { id: 2, value: "c" },],
        3: [undefined, { id: 3, value: "b" }, undefined],
        4: [undefined, undefined, { id: 4, value: "c" }],
      };

      const result = setBuffer(bufferState, getId, ...dataIteration);
      expect(result).toEqual(expectedResult);
    });

    it('should failed if getId function return NaN', () => {
      expect.assertions(1)
      try {
        setBuffer({}, (data: any) => Number.NaN, { id: 1 });
      } catch (ex) {
        expect(ex.message).toContain('getId return NaN with data:')
      }
    })

  });

  describe('Observables Sequencer', () => {

    interface TitleId { tconst: string, }
    interface Title extends TitleId { title: string }
    interface TitleDetail extends TitleId { year: number, duration: number, rating: number }

    const getId = (data: TitleId) => parseInt(data.tconst.slice(2))

    it('should be able to join observable in sequence with undefined as filler', (done) => {
      const title$ = of<Title>(
        { tconst: 'tt0000001', title: "MovieA" },
        { tconst: 'tt0000002', title: "MovieB" },
        { tconst: 'tt0000003', title: "MovieC" },
        { tconst: 'tt0000004', title: "MovieD" },
        { tconst: 'tt0000005', title: "MovieE" },
      )

      const titleDetail$ = of<TitleDetail>(
        { tconst: 'tt0000002', year: 2010, duration: 89, rating: 2.9 },
        { tconst: 'tt0000003', year: 2011, duration: 90, rating: 3.9 },
        { tconst: 'tt0000004', year: 2012, duration: 91, rating: 4.9 },
      )

      const expectedResult: Sequence<[Title | undefined, TitleDetail | undefined]>[] = [
        { id: 1, data: [{ tconst: 'tt0000001', title: "MovieA" }, undefined] },
        { id: 2, data: [{ tconst: 'tt0000002', title: "MovieB" }, { tconst: 'tt0000002', year: 2010, duration: 89, rating: 2.9 }] },
        { id: 3, data: [{ tconst: 'tt0000003', title: "MovieC" }, { tconst: 'tt0000003', year: 2011, duration: 90, rating: 3.9 }] },
        { id: 4, data: [{ tconst: 'tt0000004', title: "MovieD" }, { tconst: 'tt0000004', year: 2012, duration: 91, rating: 4.9 }] },
        { id: 5, data: [{ tconst: 'tt0000005', title: "MovieE" }, undefined] },
      ]

      const sequence$ = zipSequence(getId, title$, titleDetail$);
      const result = [] as any[]

      sequence$
        .subscribe(data => result.push(data), console.error, () => {
          expect(result).toEqual(expectedResult)
          done()
        })


    })

    it('should be able to fill missing of same sequence from all observables', (done => {
      const title$ = of<Title>(
        { tconst: 'tt0000001', title: "MovieA" },
        { tconst: 'tt0000003', title: "MovieC" },
      )

      const titleDetail$ = of<TitleDetail>(
        { tconst: 'tt0000001', year: 2010, duration: 89, rating: 2.9 },
        { tconst: 'tt0000003', year: 2011, duration: 90, rating: 3.9 },
      )

      const expectedResult: Sequence<[Title | undefined, TitleDetail | undefined]>[] = [
        { id: 1, data: [{ tconst: 'tt0000001', title: "MovieA" }, { tconst: 'tt0000001', year: 2010, duration: 89, rating: 2.9 }] },
        { id: 2, data: [undefined, undefined] },
        { id: 3, data: [{ tconst: 'tt0000003', title: "MovieC" }, { tconst: 'tt0000003', year: 2011, duration: 90, rating: 3.9 }] },
      ]

      const sequence$ = zipSequence(getId, title$, titleDetail$);
      const result = [] as any[]

      sequence$
        .subscribe(data => result.push(data), console.error, () => {
          expect(result).toEqual(expectedResult)
          done()
        })
    }))

  })


});
