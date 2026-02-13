import type { logger as Logger } from '@ayako/utility';
import {
 ApplicationsAPI as DiscordApplicationsAPI,
 type RESTPatchAPIApplicationEmojiJSONBody,
 type RESTPatchCurrentApplicationJSONBody,
 type RESTPostAPIApplicationEmojiJSONBody,
 type Snowflake,
} from '@discordjs/core';

import API from './API.js';

export default class ApplicationsAPI extends API {
 base: DiscordApplicationsAPI;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super(token, logger, guildId);

  this.base = new DiscordApplicationsAPI(this.rest);
 }

 getCurrent({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getCurrent()
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get current application', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 editCurrent(
  body: RESTPatchCurrentApplicationJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .editCurrent(body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'edit current application', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getEmojis({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getEmojis(this.appId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get application emojis', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getEmoji(emojiId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getEmoji(this.appId, emojiId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get application emoji', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 createEmoji(
  body: RESTPostAPIApplicationEmojiJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .createEmoji(this.appId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'create application emoji', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 editEmoji(
  emojiId: Snowflake,
  body: RESTPatchAPIApplicationEmojiJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .editEmoji(this.appId, emojiId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'edit application emoji', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 deleteEmoji(emojiId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .deleteEmoji(this.appId, emojiId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'delete application emoji', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
