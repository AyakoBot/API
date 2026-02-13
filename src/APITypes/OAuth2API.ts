import type { logger as Logger } from '@ayako/utility';
import { OAuth2API as DiscordOAuth2API, type Snowflake } from '@discordjs/core';

import API from './API.js';

export default class OAuth2API extends API {
 base: DiscordOAuth2API;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super(token, logger, guildId);

  this.base = new DiscordOAuth2API(this.rest);
 }

 generateAuthorizationURL(options: Parameters<DiscordOAuth2API['generateAuthorizationURL']>[0]) {
  return this.base.generateAuthorizationURL(options);
 }

 tokenExchange(
  body: Parameters<DiscordOAuth2API['tokenExchange']>[0],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .tokenExchange(body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'exchange OAuth2 token', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 refreshToken(
  body: Parameters<DiscordOAuth2API['refreshToken']>[0],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .refreshToken(body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'refresh OAuth2 token', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getToken(
  body: Parameters<DiscordOAuth2API['getToken']>[0],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getToken(body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get OAuth2 token', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getCurrentBotApplicationInformation({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getCurrentBotApplicationInformation()
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get current bot application info', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getCurrentAuthorizationInformation({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getCurrentAuthorizationInformation()
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     {
      action: 'get current authorization info',
      detail: origin,
      debug: -1,
      message: reason,
     },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 revokeToken(
  applicationSecret: string,
  body: Parameters<DiscordOAuth2API['revokeToken']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .revokeToken(this.appId, applicationSecret, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'revoke OAuth2 token', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
