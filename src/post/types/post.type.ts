export type SelectPostFields = {
  id: boolean;
  title: boolean;
  views: boolean;
  likes: boolean;
  images: boolean;
  createdAt: boolean;
  updatedAt: boolean;
  user: {
    select: SelectPostUserFields;
  };
  comments: boolean;
};

type SelectPostUserFields = {
  id: boolean;
  avatarPath: boolean;
  isDeleted: boolean;
  name: boolean;
  secondName: boolean;
  middleName: boolean;
};
