import { camelCase } from 'lodash';

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[camelCase(key)] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

function toPascalCase(str: string): string {
  return str
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => 
          index === 0 ? match.toUpperCase() : match.toUpperCase()
      )
      .replace(/\s+/g, '');
}
export { toCamelCase, toPascalCase };