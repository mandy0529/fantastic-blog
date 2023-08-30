import { v4 as uuidv4 } from 'uuid';

export function generateUUID() {
  return uuidv4().replace('-', '').slice(0, 10);
}
