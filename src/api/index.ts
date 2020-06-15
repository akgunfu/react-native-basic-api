import debounce from 'awesome-debounce-promise';
import { joinedPromise, timeoutPromise, JoinResult } from '@/utils/promise';
import { decorate } from '@/utils/decorator';

enum METHODS {
  GET = 'get',
  POST = 'post',
  PUT = 'put'
}

interface ApiResponse extends Response {
  data: any;
}

interface ApiRequest extends RequestInit {}

interface RequestParams {
  endpoint: string;
  data?: Record<string, any>;
  headers?: Record<string, string | number>;
}

interface ApiConfig {
  baseUrl: string;
  globalHeaders?: Headers;
  endpoints: (methods: {
    get: (request: RequestParams) => Promise<ApiResponse>;
    post: (request: RequestParams) => Promise<ApiResponse>;
    put: (request: RequestParams) => Promise<ApiResponse>;
  }) => Record<string, () => Promise<ApiResponse>>;
}

const api = (config: ApiConfig) => {
  const { baseUrl, globalHeaders, endpoints } = config;
  const initialize = () => (method: string, params: RequestParams) => {
    /* Assemble full url */
    let fullUrl = `${baseUrl}${params.endpoint}`;
    /* Serialize data to url on get methods */
    if (method === METHODS.GET && params.data) {
      const paramUrl = Object.entries(params.data)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      fullUrl = `${fullUrl}?${paramUrl}`;
    }
    /* Assemble all header input */
    const fullHeaders: HeadersInit = {
      ...(globalHeaders || {}),
      ...(params.headers || {}),
      'Content-Type': 'application/json'
    };
    /* Assemble fetch api request */
    const request: ApiRequest = {
      method,
      headers: fullHeaders,
      body: JSON.stringify(params.data)
    };
    return fetch(fullUrl, request);
  };

  const _api = initialize();

  const get = (request: RequestParams) =>
    process(() => _api(METHODS.GET, request));
  const post = (request: RequestParams) =>
    process(() => _api(METHODS.POST, request));
  const put = (request: RequestParams) =>
    process(() => _api(METHODS.PUT, request));

  const methods = { get, post, put };

  const process = (request: () => Promise<Response>): Promise<ApiResponse> => {
    const call = request()
      .then((response: Response) =>
        joinedPromise(resolveResponse(response), response)
      )
      .then(
        (result: JoinResult<Response>): ApiResponse =>
          <ApiResponse>{
            type: result.value.type,
            status: result.value.status,
            ok: result.value.ok,
            headers: result.value?.headers?.map ?? {},
            data: result.promiseValue
          }
      )
      .then(extractCookies)
      .catch((_ignored) => <ApiResponse>{ ok: false, data: null });

    return <Promise<ApiResponse>>new Promise((resolve) => {
      timeoutPromise(call)
        .then((response: ApiResponse) => resolve(response))
        .catch((_ignored) => resolve(<ApiResponse>{ ok: false, data: null }));
    }).catch(console.log);
  };

  /* On void function case, they will return no data hence response.json() will fail */
  const resolveResponse = (response: Response): Promise<ApiResponse> =>
    new Promise((resolve, reject) => {
      response
        .json()
        .then((data: any) => resolve(data))
        .catch(() => reject(new Error()));
    });

  /* todo, things like session, remember-me */
  const extractCookies = (response: ApiResponse) => {
    try {
    } catch (ignored) {}
    return response;
  };

  return decorate(endpoints(methods), (fn: () => Promise<ApiResponse>) =>
    debounce(fn, 500)
  );
};

export default api;
