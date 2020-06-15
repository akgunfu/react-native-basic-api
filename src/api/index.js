import debounce from 'awesome-debounce-promise';
import { joinedPromise, promiseTimeout } from '@/utils/promise';
import { getUrlByVersion } from '@/utils/url';
import { decorate } from '@/utils/decorator';

const METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put'
};

const create = ({ baseUrl, endpoints }) => {
  function initialize() {
    return (method, endpoint, data, headers = {}) => {
      let fullUrl = `${getUrlByVersion(baseUrl)}${endpoint}`;
      const fullHeaders = {
        ...headers,
        'Content-Type': 'application/json'
      };
      /* Serialize data to url on get methods */
      if (method === METHODS.GET && data) {
        const paramUrl = Object.entries(data)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
        fullUrl = `${fullUrl}?${paramUrl}`;
      }
      let request = {
        method,
        headers: fullHeaders
      };
      if (method !== METHODS.GET) {
        request = { ...request, body: data ? JSON.stringify(data) : undefined };
      }
      return fetch(fullUrl, request);
    };
  }

  const api = initialize();

  const get = (url, data) => process(() => api(METHODS.GET, url, data));
  const post = (url, data = {}) => process(() => api(METHODS.POST, url, data));
  const put = (url, data = {}) => process(() => api(METHODS.PUT, url, data));

  /* On void function case, they will return no data hence response.json() will fail */
  const resolveResponse = (response) =>
    new Promise((resolve) => {
      response
        .json()
        .then(resolve)
        .catch(() => resolve(null));
    });

  /* todo, things like session, remember-me */
  const extractCookies = (response) => {
    try {
    } catch (ignored) {}
    return response;
  };

  const process = (request) => {
    const call = request()
      .then((response) => joinedPromise(resolveResponse(response), response))
      .then(({ promiseValue: data, value: response }) => ({
        type: response.type,
        status: response.status,
        ok: response.ok,
        headers: (response.headers || {}).map || {},
        data
      }))
      .then(extractCookies)
      .catch((ignored) => ({ ok: false, data: null }));
    return new Promise((resolve) => {
      promiseTimeout(call)
        .then(resolve)
        .catch(() => {
          resolve({ ok: false, data: null });
        });
    }).catch(console.log);
  };

  return decorate(endpoints({ get, post, put }), debounce);
};

export default (config) => create(config);
