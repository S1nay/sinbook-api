import { PartialType } from '@nestjs/swagger';

import { UpdateCommentParams } from '#comment/params/update-comment.params';

export class DeletePostParams extends PartialType(UpdateCommentParams) {}
