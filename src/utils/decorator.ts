export function decorate(obj: object, decorator: () => any) {
	const _obj = {};
	// @ts-ignore
	Object.keys(obj).forEach((key: string) => (_obj[key] = decorator(obj[key])));
	return _obj;
}
