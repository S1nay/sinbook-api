import {
  Comment as CommentModel,
  Conversation as ConversationModel,
  Gender,
  Message as MessageModel,
  Post as PostModel,
  Prisma,
  User as UserModel,
} from '@prisma/client';

// -------------USER-------------
export type User = Omit<UserModel, 'passwordHash'>;
export type UserWithPasswordHash = UserModel;
export type UserWithoutEmail = Omit<User, 'email'>;

export type FollowersCountFields = {
  followersCount: number;
  followersOfCount: number;
};

export type SelectUserFollowsCount = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: Omit<
        Prisma.UserCountOutputTypeSelect,
        'posts' | 'comments' | 'conversations' | 'messages'
      >;
    };
  };
}>;

export type UserWithFollowsCount = User & FollowersCountFields;

export type UserWithoutEmailWithFollowCount = UserWithoutEmail &
  FollowersCountFields;

export type SelectShortUserInfo = {
  id: true;
  name: true;
  secondName: true;
  nickName: true;
  avatarPath: true;
};

export type ShortUserInfo = {
  id: number;
  name: string;
  secondName: string;
  nickName: string;
  avatarPath: string;
};

// -------------AUTH-------------

export type JwtTokens = {
  access: string;
  refresh: string;
};

export type TokenInfo = {
  id: number;
  nickName: string;
  name: string;
  secondName: string;
  gender: Gender;
  email: string;
};

export type AuthUser = {
  user: User;
} & JwtTokens;

// -------------POST-------------

export type SelectPostCommentsCount = Prisma.PostGetPayload<{
  include: {
    user: {
      select: SelectShortUserInfo;
    };
    _count: {
      select: Omit<Prisma.PostCountOutputTypeSelect, 'comments'>;
    };
  };
}>;

export type CommentsCountFields = {
  commentsCount: number;
};

export type Post = Omit<PostModel, 'userId'> &
  CommentsCountFields & { user: ShortUserInfo };

// -------------MESSAGE-------------

export type Message = Omit<MessageModel, 'authorId'> & {
  author: ShortUserInfo;
};

export type LastMessage = MessageModel;

// -------------CONVERSATION-------------

export type Conversation = Omit<
  ConversationModel,
  'recipientId' | 'creatorId' | 'lastMessagId'
> & {
  creator: ShortUserInfo;
  recipient: ShortUserInfo;
  lastMessage: LastMessage;
};

export type ConversationInfo = ConversationModel & {
  creator: ShortUserInfo;
  recipient: ShortUserInfo;
  messages: Message[];
};

// -------------COMMENT-------------

export type Comment = Omit<CommentModel, 'postId' | 'userId'>;
