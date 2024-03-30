export type CreateCommentParams = {
  content: string;
  userId: number;
  postId: number;
};

export type DeleteCommentParams = {
  userId: number;
  id: number;
};

export type EditCommentParams = {
  userId: number;
  id: number;
  content: string;
};
