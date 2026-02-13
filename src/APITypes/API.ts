import type { logger as Logger } from '@ayako/utility';
import { PermissionFlagsBits } from '@discordjs/core';
import { REST } from '@discordjs/rest';

import {
 RequestHandlerError,
 type Options,
 type RequestHandlerErrorType,
} from './RequestHandlerError.js';

export default abstract class API {
 rest: REST;
 protected appId: string;
 protected logger: typeof Logger;
 protected guildId: string;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  this.rest = new REST({
   api: `http://${process.argv.includes('--dev') ? 'localhost' : 'nirn'}:8080/api`,
  });
  this.rest.setToken(token);
  this.appId = Buffer.from(token.replace('Bot ', '').split('.')[0], 'base64').toString();
  this.logger = logger;
  this.guildId = guildId;
 }

 static hasPerm(permissions: bigint, permission: bigint): boolean {
  return (
   (permissions & permission) === permission ||
   (permission & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator
  );
 }

 protected handleError<T extends RequestHandlerErrorType>(
  path: Options<T>,
  origin: {
   action: string;
   detail: string;
   debug: number;
   message: string;
  },
  error: {
   errorMessage: string;
   error: Error;
  },
 ) {
  this.logger.warn(
   `[PermissionUtility] Missing permission to ${origin.action} in ${
    'channelId' in path
     ? `guild ${path.guildId}, channel ${path.channelId}`
     : 'applicationId' in path
       ? `application ${path.applicationId}, guild ${path.guildId}`
       : 'webhookId' in path
         ? `webhook ${path.webhookId}`
         : 'interactionId' in path
           ? `interaction ${path.interactionId}`
           : 'inviteCode' in path
             ? `invite ${path.inviteCode}`
             : `guild ${path.guildId}`
   }. Detail: ${origin.detail}. Debug: ${origin.debug}. Message: ${origin.message}. Error: ${error.errorMessage}`,
  );
  this.logger.warn(error.error.message, error.error.cause, error.error.stack);

  return { success: false, path, origin, error };
 }

 protected createError<T extends RequestHandlerErrorType>(
  options: Options<T>,
  {
   action,
   detail,
   debug,
   message,
  }: { action: string; detail: string; debug: number; message: string },
  { errorMessage, error }: { errorMessage: string; error: Error },
 ) {
  return new RequestHandlerError(options, errorMessage)
   .setAction(action)
   .setDetail(detail)
   .setDebug(debug)
   .setReason(message)
   .setDebug(debug)
   .setError(error);
 }
}
