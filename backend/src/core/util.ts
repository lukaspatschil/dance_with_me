export function setWeakTimeout(this: any, ...args: any[]): number {
  const ret = setTimeout.apply(this, args);
  ret.unref();
  return ret;
}

export type NonEmpty<T> = T extends Array<infer U> ? [U, ...U[]] : never;
