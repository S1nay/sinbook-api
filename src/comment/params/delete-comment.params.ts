import { PartialType } from '@nestjs/swagger';

import { UpdateCommentParams } from './update-comment.params';

export class DeleteCommentParams extends PartialType(UpdateCommentParams) {}
