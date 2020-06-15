export interface JoinResult<T extends any> {
  promiseValue: T;
  value: any;
}

export const joinedPromise = <T extends any>(
  promise: Promise<T>,
  value: any
): Promise<JoinResult<T>> => {
  return new Promise((resolve, reject) =>
    promise
      .then((promiseValue) => resolve({ promiseValue, value }))
      .catch(reject)
  );
};

export const timeoutPromise = function <T extends any>(
  promise: Promise<T>,
  ms = 10000
): Promise<T> {
  /* Create a promise that rejects in <ms> milliseconds */
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timed out in ${ms}ms.`));
    }, ms);
  });
  /* Returns a race between our timeout and the passed in promise */
  // @ts-ignore
  return Promise.race([promise, timeout]);
};
