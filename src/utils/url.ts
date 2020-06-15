// @ts-ignore
import { Platform } from 'react-native';

export function getUrlByVersion(url: string) {
  if (!url) {
    return url;
  }
  // workaround to use both http and https depending on api level
  if (Platform.Version >= 24) {
    url = url.replace('http:', 'https:');
  } else {
    url = url.replace('https:', 'http:');
  }
  return url;
}
