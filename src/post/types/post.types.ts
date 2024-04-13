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
