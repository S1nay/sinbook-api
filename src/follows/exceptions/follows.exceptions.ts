import { BadRequestException } from '@nestjs/common';

import { COULD_NOT_FOLLOW_YORSELF } from '#follows/constants/follows.constants';

export class CouldNotFollowYorselfException extends BadRequestException {
  constructor() {
    super(COULD_NOT_FOLLOW_YORSELF);
  }
}
