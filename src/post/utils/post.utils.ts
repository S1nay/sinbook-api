import { Like } from '@prisma/client';

import { FindUserPostsParams } from '#post/types/post.types';
import { exclude, transformFieldCount } from '#utils/helpers';
import { CommentsCountFields, Post, SelectPost } from '#utils/types';

export function transformPost(post: SelectPost) {
  const transformedPost = transformFieldCount<SelectPost, CommentsCountFields>(
    post,
    ['commentsCount'],
  );

  return exclude(transformedPost, ['userId']);
}

export function getPostFilters(params: FindUserPostsParams) {
  const { userId, paginationParams, followingBy } = params;

  const userFilter = {
    ...(userId && { userId }),
  };

  const searchFilter = {
    ...(paginationParams.search && {
      content: { contains: paginationParams.search },
    }),
  };

  const followingFilter = {
    ...(followingBy && {
      user: { followers: { some: { followerId: userId } } },
    }),
  };

  return {
    AND: [
      { OR: [userId && followingBy ? followingFilter : userFilter] },
      searchFilter,
    ],
  };
}

export function transformArrayPosts(
  posts: (Omit<Post, 'likes' | 'commentsCount'> & {
    userId: number;
    likes: Like[];
    _count: { comments: number };
  })[],
) {
  return posts.map(transformPost).map((post) => ({
    ...post,
    likes: post.likes.map((like) => like.userId),
  }));
}
