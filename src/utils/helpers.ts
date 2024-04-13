export function exclude<Entity, Key extends keyof Entity>(
  entity: Entity,
  keys: Key[],
): Omit<Entity, Key> {
  return Object.fromEntries(
    Object.entries(entity).filter(([key]) => {
      const newKey = key as Key;
      return !keys.includes(newKey);
    }),
  ) as Omit<Entity, Key>;
}

export function createObjectByKeys<T>(
  keys: (keyof T)[],
): Record<(typeof keys)[number], true> {
  const object = {} as Record<(typeof keys)[number], true>;

  keys.forEach((key) => {
    object[key] = true;
  });

  return object as Record<(typeof keys)[number], true>;
}

export function transformFieldCount<
  K extends {
    _count?: {
      [key: string]: number;
    };
  },
  T,
>(entity: K, modifiedKeys: string[]) {
  const count = entity._count;

  const modifiedValues = Object.keys(count).reduce((acc, key) => {
    for (const modifiedKey of modifiedKeys) {
      if (!modifiedKey.toLocaleLowerCase().includes(key)) continue;
      acc[modifiedKey] = count[key];
      return acc;
    }
  }, {}) as T;

  delete entity._count;

  return {
    ...entity,
    ...modifiedValues,
  };
}
