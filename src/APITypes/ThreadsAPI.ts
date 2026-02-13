import { type Cache, type logger as Logger, getChannelPerms } from '@ayako/utility';
import {
 ThreadsAPI as DiscordThreadsAPI,
 PermissionFlagsBits,
 type Snowflake,
} from '@discordjs/core';

import API from './API.js';

export default class ThreadsAPI extends API {
 base: DiscordThreadsAPI;
 private cache: Cache;

 constructor(token: string, logger: typeof Logger, guildId: string, cache: Cache) {
  super(token, logger, guildId);

  this.base = new DiscordThreadsAPI(this.rest);
  this.cache = cache;
 }

 join(
  threadId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .join(threadId)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId: threadId },
     { action: 'join thread', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async addMember(
  threadId: Snowflake,
  userId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const { allow: perms } = await getChannelPerms.call(
   this.cache,
   this.guildId,
   this.appId,
   threadId,
  );

  if (!API.hasPerm(perms, PermissionFlagsBits.SendMessagesInThreads)) {
   return this.createError(
    { guildId: this.guildId, channelId: threadId },
    { action: 'add thread member', detail: origin, debug: 1, message: reason },
    { errorMessage: 'Missing SendMessagesInThreads permission', error: new Error() },
   );
  }

  return this.base
   .addMember(threadId, userId)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId: threadId },
     { action: 'add thread member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 leave(
  threadId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .leave(threadId)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId: threadId },
     { action: 'leave thread', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async removeMember(
  threadId: Snowflake,
  userId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const { allow: perms } = await getChannelPerms.call(
   this.cache,
   this.guildId,
   this.appId,
   threadId,
  );

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageThreads)) {
   return this.createError(
    { guildId: this.guildId, channelId: threadId },
    { action: 'remove thread member', detail: origin, debug: 1, message: reason },
    { errorMessage: 'Missing ManageThreads permission', error: new Error() },
   );
  }

  return this.base
   .removeMember(threadId, userId)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId: threadId },
     { action: 'remove thread member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getMember(
  threadId: Snowflake,
  userId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getMember(threadId, userId)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId: threadId },
     { action: 'get thread member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getAllMembers(
  threadId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getAllMembers(threadId)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId: threadId },
     { action: 'get all thread members', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
