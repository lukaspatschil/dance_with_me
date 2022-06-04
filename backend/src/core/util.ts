export function setWeakTimeout(this: any, ...args: any[]): number {
  const ret = setTimeout.apply(this, args);
  ret.unref();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ret;
}

export type NonEmpty<T> = T extends (infer U)[] ? [U, ...U[]] : never;
