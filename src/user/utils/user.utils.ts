import { exclude, transformFieldCount } from '#utils/helpers';
import { FollowersCountFields, SelectUserFollowsCount } from '#utils/types';

export function transformUser(user: SelectUserFollowsCount) {
  const transformedUser = transformFieldCount<
    SelectUserFollowsCount,
    FollowersCountFields
  >(user, ['followersCount', 'followsCount']);

  return exclude(transformedUser, ['passwordHash']);
}
