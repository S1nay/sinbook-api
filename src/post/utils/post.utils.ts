import { exclude, transformFieldCount } from '#utils/helpers';
import { CommentsCountFields, SelectPostCommentsCount } from '#utils/types';

export function transformPost(post: SelectPostCommentsCount) {
  const transformedPost = transformFieldCount<
    SelectPostCommentsCount,
    CommentsCountFields
  >(post, ['commentsCount']);

  return exclude(transformedPost, ['userId']);
}
