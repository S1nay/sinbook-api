import { exclude, transformFieldCount } from '#utils/helpers';
import { CommentsCountFields, SelectPost } from '#utils/types';

export function transformPost(post: SelectPost) {
  const transformedPost = transformFieldCount<SelectPost, CommentsCountFields>(
    post,
    ['commentsCount'],
  );

  return exclude(transformedPost, ['userId']);
}
