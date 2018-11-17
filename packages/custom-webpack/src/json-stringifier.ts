import {inspect} from 'util';
export function stringify(object: any): string{
  return inspect(object, {breakLength: 2, compact: false})
}