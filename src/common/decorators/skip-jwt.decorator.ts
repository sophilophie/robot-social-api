import {CustomDecorator, SetMetadata} from '@nestjs/common';

export const SKIP_JWT_KEY = 'shouldSkipJwtAuth';
export const SkipJwtAuth = (): CustomDecorator => SetMetadata(SKIP_JWT_KEY, true);
