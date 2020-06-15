/**
 * Trivial promise to make each action ordered
 * Example => sequence().then(promise1).then()...
 */
export const sequence = () => new Promise((resolve) => resolve());

export const promiseTimeout = function (promise: Promise<any>, ms = 10000) {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timed out in ${ms}ms.`));
    }, ms);
  });
  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
};

export const joinedPromise = (promise: Promise<any>, value: any) => {
  return new Promise((resolve, reject) =>
    promise
      .then((promiseValue) => resolve({ promiseValue, value }))
      .catch(reject)
  );
};
