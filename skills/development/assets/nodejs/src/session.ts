/**
 * Read the named identifier from a serialized item.
 */
export const itemId = (input: string): string | undefined =>
  /item=(?<id>\d+)/u.exec(input)?.groups?.id;
