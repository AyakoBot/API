import { type Cache, type logger as Logger, getChannelPerms } from '@ayako/utility';
import { PollAPI as DiscordPollAPI, PermissionFlagsBits, type Snowflake } from '@discordjs/core';

import API from './API.js';

export default class PollAPI extends API {
 base: DiscordPollAPI;
 private cache: Cache;

 constructor(token: string, logger: typeof Logger, guildId: string, cache: Cache) {
  super(token, logger, guildId);

  this.base = new DiscordPollAPI(this.rest);
  this.cache = cache;
 }

 async getAnswerVoters(
  channelId: Snowflake,
  messageId: Snowflake,
  answerId: number,
  query: Parameters<DiscordPollAPI['getAnswerVoters']>[3],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const { allow: perms } = await getChannelPerms.call(
   this.cache,
   this.guildId,
   this.appId,
   channelId,
  );

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return this.createError(
    { guildId: this.guildId, channelId },
    { action: 'get answer voters', detail: origin, debug: 1, message: reason },
    { errorMessage: 'Missing ViewChannel permission', error: new Error() },
   );
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return this.createError(
    { guildId: this.guildId, channelId },
    { action: 'get answer voters', detail: origin, debug: 2, message: reason },
    { errorMessage: 'Missing ReadMessageHistory permission', error: new Error() },
   );
  }

  return this.base
   .getAnswerVoters(channelId, messageId, answerId, query)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId },
     { action: 'get answer voters', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async expirePoll(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const { allow: perms } = await getChannelPerms.call(
   this.cache,
   this.guildId,
   this.appId,
   channelId,
  );

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageMessages)) {
   return this.createError(
    { guildId: this.guildId, channelId },
    { action: 'expire poll', detail: origin, debug: 1, message: reason },
    { errorMessage: 'Missing ManageMessages permission', error: new Error() },
   );
  }

  return this.base
   .expirePoll(channelId, messageId)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId },
     { action: 'expire poll', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
