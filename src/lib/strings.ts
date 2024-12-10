export function get_instances_of(str: string, sub: string): number[] {
  const str_len = str.length;
  if (str_len == 0) return [];

  let start = 0,
    index,
    indices: number[] = [];

  while ((index = str.indexOf(sub, start)) > -1) {
    indices.push(index);
    start = index + str_len;
  }

  return indices;
}

export function apply_placeholder(
  str: string,
  placeholder: string,
  occurance: number,
  val: string,
): string {
  let index,
    start = 0;

  for (let i = 0; (index = str.indexOf(placeholder, start)) > -1; ++i) {
    if (i + 1 === occurance) {
      const p1 = str.slice(0, index);
      const p2 = str.slice(index + placeholder.length);
      return p1 + val + p2;
    }
    start = index + placeholder.length;
  }

  throw new Error(`no occurance ${occurance} of ${placeholder} in ${str}`);
}

export function is_screaming_case(s: string): boolean {
  return s.toUpperCase() === s;
}
