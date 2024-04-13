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

export function transformConversationCount<
  K extends {
    _count?: {
      [key: string]: number;
    };
  },
>(entity: K, modifiedKey: string) {
  const count = entity._count;

  const modifiedValues = Object.keys(count).reduce((acc, key) => {
    acc[modifiedKey] = count[key];
    return acc;
  }, {});

  delete entity._count;

  return {
    ...entity,
    ...modifiedValues,
  };
}
