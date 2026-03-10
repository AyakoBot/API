import type { logger as Logger } from '@ayako/utility';
import { PermissionFlagsBits } from '@discordjs/core';
import { REST } from '@discordjs/rest';

import { EventEmitter } from 'events';
import type { Options, RequestHandlerErrorType } from '../types/index.js';
import RequestHandlerError from './RequestHandlerError.js';

export default abstract class API extends EventEmitter {
 rest: REST;
 protected appId: string;
 protected logger: typeof Logger;
 protected guildId: string;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super();
  this.rest = new REST({
   api: `http://${process.argv.includes('--local') ? 'localhost' : 'nirn'}:8080/api`,
  });
  this.rest.setToken(token);
  this.appId = Buffer.from(token.replace('Bot ', '').split('.')[0], 'base64').toString();
  this.logger = logger;
  this.guildId = guildId;
 }

 static hasPerm(permissions: bigint, permission: bigint): boolean {
  return (
   (permissions & permission) === permission ||
   (permissions & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator
  );
 }

 protected handleError<T extends RequestHandlerErrorType>(err: RequestHandlerError<T>) {
  this.logger.debug(
   `[PermissionUtility] Missing permission to ${err.action} in ${
    'channelId' in err.options
     ? `guild ${err.options.guildId}, channel ${err.options.channelId}`
     : 'applicationId' in err.options
       ? `application ${err.options.applicationId}, guild ${err.options.guildId}`
       : 'webhookId' in err.options
         ? `webhook ${err.options.webhookId}`
         : 'interactionId' in err.options
           ? `interaction ${err.options.interactionId}`
           : 'inviteCode' in err.options
             ? `invite ${err.options.inviteCode}`
             : `guild ${err.options.guildId}`
   }. Detail: ${err.detail}. Debug: ${err.debug}. Message: ${err.reason}. Error: ${err.errorMessage}`,
  );
  this.logger.warn(err.error?.message, err.error?.cause, err.error?.stack);

  this.emit('error', err);
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
  const err = new RequestHandlerError(options, errorMessage)
   .setAction(action)
   .setDetail(detail)
   .setDebug(debug)
   .setReason(message)
   .setDebug(debug)
   .setError(error)
   .setAppId(this.appId);

  this.handleError(err);

  return err;
 }
}
