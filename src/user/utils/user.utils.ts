import { FindUsersParams } from '#user/types/user.type';
import { exclude, transformFieldCount } from '#utils/helpers';
import {
  ProfileCountFields,
  SelectUserFollowsCount,
  UserWithFollows,
} from '#utils/types';

export function transformUser(user: SelectUserFollowsCount) {
  const transformedUser = transformFieldCount<
    SelectUserFollowsCount,
    ProfileCountFields
  >(user, ['followersCount', 'followsCount', 'postsCount']);

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

export function getUserFilters(params: FindUsersParams) {
  const { search, follows, followers, userId } = params;

  const searchFilters = search
    ? [
        { name: { contains: search, mode: 'insensitive' } },
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
    AND: [{ OR: searchFilters }, ...relationalFilters],
  };
}
