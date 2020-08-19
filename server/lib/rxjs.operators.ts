import { concat, zip, Observable, interval } from "rxjs";
import { map, flatMap, mapTo, scan, skip, tap, take } from "rxjs/operators";
import _, { } from "lodash";
import { inspect } from "util";

export const UNDEFINED = interval().pipe(mapTo(undefined));

/**
 * Custom Zip Like function but completed on the longuest Observable with 'undefined' as filler
 */
export function zipAll<T1, T2>(v1: Observable<T1>, v2: Observable<T2>): Observable<[T1, T2]>;
export function zipAll<T1, T2, T3>(v1: Observable<T1>, v2: Observable<T2>, v3: Observable<T3>): Observable<[T1, T2, T3]>;
export function zipAll<T1, T2, T3, T4>(v1: Observable<T1>, v2: Observable<T2>, v3: Observable<T3>, v4: Observable<T4>): Observable<[T1, T2, T3, T4]>;
export function zipAll<T1, T2, T3, T4, T5>(v1: Observable<T1>, v2: Observable<T2>, v3: Observable<T3>, v4: Observable<T4>, v5: Observable<T5>): Observable<[T1, T2, T3, T4, T5]>;
export function zipAll<T1, T2, T3, T4, T5, T6>(v1: Observable<T1>, v2: Observable<T2>, v3: Observable<T3>, v4: Observable<T4>, v5: Observable<T5>, v6: Observable<T6>): Observable<[T1, T2, T3, T4, T5, T6]>;
export function zipAll<R>(...observables: Observable<any>[]): Observable<any>;
export function zipAll(...observables: Observable<any>[]): Observable<any> {
  return new Observable(observer => {
    const zipSubscription = zip(...observables.map(ob$ => concat(ob$, UNDEFINED)))
      .subscribe(values => {
        values.every(value => value === undefined) ? observer.complete() : observer.next(values)
      })
    observer.add(zipSubscription)
  })
}


export function zipSequence<T, T1, T2>(getId: ({ (data: T): number }), o1: Observable<T1>, o2: Observable<T2>): Observable<Sequence<[T1, T2]>>;
export function zipSequence<T, T1, T2, T3>(getId: ({ (data: T): number }), o1: Observable<T1>, o2: Observable<T2>, o3: Observable<T3>): Observable<Sequence<[T1, T2, T3]>>;
export function zipSequence<T, T1, T2, T3, T4>(getId: ({ (data: T): number }), o1: Observable<T1>, o2: Observable<T2>, o3: Observable<T3>, o4: Observable<T4>): Observable<Sequence<[T1, T2, T3, T4]>>;
export function zipSequence<T, T1, T2, T3, T4, T5>(getId: ({ (data: T): number }), o1: Observable<T1>, o2: Observable<T2>, o3: Observable<T3>, o4: Observable<T4>, o5: Observable<T5>): Observable<Sequence<[T1, T2, T3, T4, T5]>>;
export function zipSequence(getId: ({ (data: any): number }), ...observables: Observable<any>[]): Observable<any> {
  return new Observable(observer => {
    return zipAll<any>(interval().pipe(skip(1), take(10)), ...observables)
      .pipe(
        scan((state, [index, ...lines]: [number, any]) => {
          const buffer = setBuffer({ ...state.buffer }, getId, ...lines);
          Object.keys(buffer).forEach(idString => {
            const id = parseInt(idString)
            if (id < index)
              delete buffer[id]
          })
          const newState = { index, buffer, EOF: _.isEmpty(buffer) };
          return newState
        }, { index: 0, buffer: {} as SequencerBuffer<any>, EOF: false }),
        tap(state => state.EOF && observer.complete()),
        map(state => {
          if (state.buffer[state.index] === undefined) {
            return [{ id: state.index, data: Array(observables.length).fill(undefined) }]
          }
          return Object.keys(state.buffer)
            .map(id => parseInt(id))
            .filter(id => id <= state.index)
            .map(id => ({ id, data: state.buffer[id] }))
        }),
        flatMap(x => x),
      )
      .subscribe(
        d => observer.next(d)
      );
  })
}

export interface Sequence<T> {
  id: number,
  data: T;
}

/**
 * buffer internal data structure
 */
export interface SequencerBuffer<T> {
  [sequenceId: number]: Array<T | undefined>;
}

/**
 * Function that order input by id into an indexed buffer.
 *
 * @param buffer Previous buffer state
 * @param getId Function for extracting data id
 * @param datas new data from observables
 */
export const setBuffer = <T>(
  buffer: SequencerBuffer<T>,
  getId: { (item: T): number },
  ...datas: (T | undefined)[]
) => {

  const newBuffer = _.cloneDeep(buffer)
  const ids = datas.map(data => {
    const id = data ? getId(data) : undefined
    if (Number.isNaN(id)) {
      throw new Error(`getId return NaN with data: ${inspect(data, undefined, 8)}`)
    } else {
      return id
    }
  });

  _.range(_.min(ids)!, _.max(ids)! + 1).forEach(id => {
    if (newBuffer[id] === undefined)
      newBuffer[id] = new Array<T | undefined>(datas.length).fill(undefined);
  })

  datas.forEach((data, index) => {
    if (data !== undefined) {
      const itemId = getId(data);
      newBuffer[itemId][index] = data;
    }
  });
  return newBuffer;
};
