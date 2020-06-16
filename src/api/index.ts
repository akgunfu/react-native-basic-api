import debounce from 'awesome-debounce-promise';
import { timeoutPromise } from '../utils/promise';
import { decorate } from '../utils/decorator';

interface ApiConfig {
  baseUrl: string;
  headers?: Record<string, string | number>;
  endpoints: (methods: {
    get: <T extends any>(
      endpoint: string,
      data?: Record<string, any>,
      headers?: Record<string, any>
    ) => Promise<ApiResponse<T>>;
    post: <T extends any>(
      endpoint: string,
      data?: Record<string, any>,
      headers?: Record<string, any>
    ) => Promise<ApiResponse<T>>;
    put: <T extends any>(
      endpoint: string,
      data?: Record<string, any>,
      headers?: Record<string, any>
    ) => Promise<ApiResponse<T>>;
  }) => Record<string, <T extends any>(request: ApiRequest) => Promise<ApiResponse<T>>>;
}

interface ApiRequest {
  endpoint: string;
  data?: Record<string, any>;
  headers?: Record<string, any>;
}

interface ApiResponse<T extends any> extends Response {
  data: T;
}

const METHOD = {
  GET: 'get',
  POST: 'post',
  PUT: 'put'
};

const api = (
  config: ApiConfig
): Record<string, <T extends any>(request: ApiRequest) => Promise<ApiResponse<T>>> => {
  const initialize = () => (method: string, request: ApiRequest) => {
    /* Assemble full url */
    let fullUrl = `${config.baseUrl}${request.endpoint}`;
    /* Serialize data to url on get methods */
    if (method === METHOD.GET && request.data) {
      const paramUrl = Object.entries(request.data)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      fullUrl = `${fullUrl}?${paramUrl}`;
    }
    /* Assemble all header input */
    const fullHeaders = {
      ...(config.headers || {}),
      ...(request.headers || {}),
      'Content-Type': 'application/json'
    };
    return fetch(fullUrl, {
      method,
      headers: fullHeaders,
      body: method === METHOD.GET ? undefined : JSON.stringify(request.data)
    });
  };

  const _api = initialize();

  const get = <T extends any>(
    endpoint: string,
    data?: Record<string, any>,
    headers?: Record<string, any>
  ) => call<T>(() => _api(METHOD.GET, { endpoint, data, headers }));
  const post = <T extends any>(
    endpoint: string,
    data?: Record<string, any>,
    headers?: Record<string, any>
  ) => call<T>(() => _api(METHOD.POST, { endpoint, data, headers }));
  const put = <T extends any>(
    endpoint: string,
    data?: Record<string, any>,
    headers?: Record<string, any>
  ) => call<T>(() => _api(METHOD.PUT, { endpoint, data, headers }));

  const methods = { get, post, put };

  async function call<T extends any>(
    promiseCallback: () => Promise<Response>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await timeoutPromise(promiseCallback());
      const data = await response.json();
      return <ApiResponse<T>>{
        type: response.type,
        status: response.status,
        ok: response.ok,
        headers: response.headers || {},
        data
      };
    } catch (e) {
      console.log(e);
      return <ApiResponse<T>>{ ok: false, data: null };
    }
  }

  const decorator = (fn: () => Promise<ApiResponse<any>>) => debounce(fn, 500);
  return decorate(config.endpoints(methods), decorator);
};

export default api;
