import { v4 as uuidv4 } from 'uuid';

export const slugify = (title: string): string => {
  return `${title.toLowerCase().replace(/ /g, '-')}-${uuidv4()}`;
};
