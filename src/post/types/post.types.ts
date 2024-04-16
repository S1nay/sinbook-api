import { PaginationParams } from '#utils/types';

export type CreatePostParams = {
  content: string;
  images?: string[];
  userId: number;
};

export type EditPostParams = CreatePostParams & { id: number };

export type DeletePostParams = {
  userId: number;
  id: number;
};

export type FindUserPostsParams = {
  userId: number;
  paginationParams: PaginationParams;
};
