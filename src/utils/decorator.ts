export function decorate(obj: object, decorator: (param: any) => any) {
  const _obj = {};
  // @ts-ignore
  Object.keys(obj).forEach((key: string) => (_obj[key] = decorator(obj[key])));
  return _obj;
}
