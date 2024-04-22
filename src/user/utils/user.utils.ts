import { FindUsersParams } from '#user/types/user.type';
import { exclude, transformFieldCount } from '#utils/helpers';
import {
  FollowersCountFields,
  SelectUserFollowsCount,
  UserWithFollows,
} from '#utils/types';

export function transformUser(user: SelectUserFollowsCount) {
  const transformedUser = transformFieldCount<
    SelectUserFollowsCount,
    FollowersCountFields
  >(user, ['followersCount', 'followsCount']);

  return exclude(transformedUser, ['passwordHash']);
}

export function transformUsersArray(users: UserWithFollows[]) {
  return users.map((user) => {
    return !user.follows.length || !user.follows?.[0].mutualFollow
      ? { ...exclude(user, ['follows']), mutualFollow: false }
      : {
          ...exclude(user, ['follows']),
          mutualFollow: user.follows[0].mutualFollow,
        };
  });
}

export function getFilters(params: FindUsersParams) {
  const { search, follows, followers, userId } = params;

  const searchFilters = search
    ? [
        { name: { contains: search, mode: 'insensitive' } },
        { secondName: { contains: search, mode: 'insensitive' } },
        { middleName: { contains: search, mode: 'insensitive' } },
        { nickName: { contains: search, mode: 'insensitive' } },
      ]
    : [];

  const relationalFilters = [];

  if (follows && userId) {
    relationalFilters.push({ followers: { some: { followerId: userId } } });
  }
  if (followers && userId) {
    relationalFilters.push({ follows: { some: { followingId: userId } } });
  }

  return {
    AND: [...(search ? [{ OR: searchFilters }] : []), ...relationalFilters],
  };
}
