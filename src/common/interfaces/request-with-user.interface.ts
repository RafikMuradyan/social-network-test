import { Request } from 'express';
import { IUserData } from 'src/modules/auth/interfaces';

export interface IRequestWithUser extends Request {
  user: IUserData;
}
