import {
  Comment as CommentModel,
  Conversation as ConversationModel,
  Gender,
  Message as MessageModel,
  Notification as NotificationModel,
  Post as PostModel,
  Prisma,
  User as UserModel,
} from '@prisma/client';

// -------------USER-------------
export type User = Omit<UserModel, 'passwordHash'>;
export type UserWithPasswordHash = UserModel;
export type UserWithoutEmail = Omit<User, 'email'>;

export type UserWithFollows = ShortUserInfo & {
  follows: {
    mutualFollow: boolean;
  }[];
};

export type FollowersCountFields = {
  followersCount: number;
  followersOfCount: number;
};

export type SelectUserFollowsCount = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: Omit<
        Prisma.UserCountOutputTypeSelect,
        | 'posts'
        | 'comments'
        | 'conversationRecipient'
        | 'conversationCreator'
        | 'messages'
        | 'likes'
        | 'notificationRecipient'
        | 'notificationAuthor'
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

export type SelectPost = Prisma.PostGetPayload<{
  include: {
    user: {
      select: SelectShortUserInfo;
    };
    _count: {
      select: Omit<Prisma.PostCountOutputTypeSelect, 'comments' | 'likes'>;
    };
    likes: true;
  };
}>;

export type CommentsCountFields = {
  commentsCount: number;
};

export type Post = Omit<PostModel, 'userId'> &
  CommentsCountFields & { user: ShortUserInfo; likes: number[] };

// -------------MESSAGE-------------

export type Message = Omit<MessageModel, 'authorId'> & {
  author: ShortUserInfo;
};

export type LastMessage = MessageModel;

// -------------CONVERSATION-------------

export type SelectConversation = Prisma.ConversationGetPayload<{
  include: {
    creator: { select: SelectShortUserInfo };
    recipient: { select: SelectShortUserInfo };
    lastMessage: true;
    _count: {
      select: {
        messages: {
          where: {
            isReaded: false;
          };
        };
      };
    };
  };
}>;

export type ConversationUnreadMessagesCount = {
  unreadMessagesCount?: number;
};

export type Conversation = Omit<
  ConversationModel,
  'recipientId' | 'creatorId' | 'lastMessageId'
> &
  ConversationUnreadMessagesCount & {
    recipient: ShortUserInfo;
    creator: ShortUserInfo;
    lastMessage?: LastMessage;
    messages?: Message[];
  };

// -------------COMMENT-------------

export type Comment = Omit<CommentModel, 'postId' | 'userId'>;

// -------------PAGINATION-------------

export type PaginationParams = {
  page?: number;
  perPage?: number;
  search?: string;
};

export type PaginationMeta = {
  totalItems: number;
  totalPages: number;
  page: number;
  perPage: number;
};

export type PaginationResponse<T> = {
  results: T[];
  meta: PaginationMeta;
};

// -------------FOLLOWS-------------

export type Follow = {
  followerId: number;
  followingId: number;
  mutualFollow: boolean;
};

export type FollowingUser = ShortUserInfo & { mutualFollow: boolean };

// -------------NOTIFICATION-------------

export type Notification = Omit<NotificationModel, 'authorId'>;
