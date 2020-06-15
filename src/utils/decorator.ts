export function decorate<T extends Record<string, any>>(obj: T, decorator: (param: any) => any): T {
  const _obj = {};
  // @ts-ignore
  Object.keys(obj).forEach((key: string) => (_obj[key] = decorator(obj[key])));
  return <T>_obj;
}
