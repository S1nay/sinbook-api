import { PartialType } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';

export class CreatePostResponse extends PartialType(PostEntity) {}
export class UpdatePostResponse extends PartialType(PostEntity) {}
export class FindUniqueResponse extends PartialType(PostEntity) {}
