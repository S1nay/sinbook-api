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
