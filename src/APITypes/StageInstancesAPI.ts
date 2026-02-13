import { type Cache, type logger as Logger, getChannelPerms } from '@ayako/utility';
import {
 StageInstancesAPI as DiscordStageInstancesAPI,
 PermissionFlagsBits,
 type Snowflake,
} from '@discordjs/core';

import API from './API.js';

export default class StageInstancesAPI extends API {
 base: DiscordStageInstancesAPI;
 private cache: Cache;

 constructor(token: string, logger: typeof Logger, guildId: string, cache: Cache) {
  super(token, logger, guildId);

  this.base = new DiscordStageInstancesAPI(this.rest);
  this.cache = cache;
 }

 async create(
  body: Parameters<DiscordStageInstancesAPI['create']>[0],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const { allow: perms } = await getChannelPerms.call(
   this.cache,
   this.guildId,
   this.appId,
   body.channel_id,
  );

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageChannels)) {
   return this.createError(
    { guildId: this.guildId, channelId: body.channel_id },
    { action: 'create stage instance', detail: origin, debug: 1, message: reason },
    { errorMessage: 'Missing ManageChannels permission', error: new Error() },
   );
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.MuteMembers)) {
   return this.createError(
    { guildId: this.guildId, channelId: body.channel_id },
    { action: 'create stage instance', detail: origin, debug: 2, message: reason },
    { errorMessage: 'Missing MuteMembers permission', error: new Error() },
   );
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.MoveMembers)) {
   return this.createError(
    { guildId: this.guildId, channelId: body.channel_id },
    { action: 'create stage instance', detail: origin, debug: 3, message: reason },
    { errorMessage: 'Missing MoveMembers permission', error: new Error() },
   );
  }

  if (body.send_start_notification && !API.hasPerm(perms, PermissionFlagsBits.MentionEveryone)) {
   return this.createError(
    { guildId: this.guildId, channelId: body.channel_id },
    { action: 'create stage instance', detail: origin, debug: 4, message: reason },
    { errorMessage: 'Missing MentionEveryone permission for start notification', error: new Error() },
   );
  }

  return this.base
   .create(body, { reason })
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId: body.channel_id },
     { action: 'create stage instance', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 get(
  channelId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .get(channelId)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId },
     { action: 'get stage instance', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async edit(
  channelId: Snowflake,
  body: Parameters<DiscordStageInstancesAPI['edit']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const { allow: perms } = await getChannelPerms.call(
   this.cache,
   this.guildId,
   this.appId,
   channelId,
  );

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageChannels)) {
   return this.createError(
    { guildId: this.guildId, channelId },
    { action: 'edit stage instance', detail: origin, debug: 1, message: reason },
    { errorMessage: 'Missing ManageChannels permission', error: new Error() },
   );
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.MuteMembers)) {
   return this.createError(
    { guildId: this.guildId, channelId },
    { action: 'edit stage instance', detail: origin, debug: 2, message: reason },
    { errorMessage: 'Missing MuteMembers permission', error: new Error() },
   );
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.MoveMembers)) {
   return this.createError(
    { guildId: this.guildId, channelId },
    { action: 'edit stage instance', detail: origin, debug: 3, message: reason },
    { errorMessage: 'Missing MoveMembers permission', error: new Error() },
   );
  }

  return this.base
   .edit(channelId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId },
     { action: 'edit stage instance', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async delete(
  channelId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const { allow: perms } = await getChannelPerms.call(
   this.cache,
   this.guildId,
   this.appId,
   channelId,
  );

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageChannels)) {
   return this.createError(
    { guildId: this.guildId, channelId },
    { action: 'delete stage instance', detail: origin, debug: 1, message: reason },
    { errorMessage: 'Missing ManageChannels permission', error: new Error() },
   );
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.MuteMembers)) {
   return this.createError(
    { guildId: this.guildId, channelId },
    { action: 'delete stage instance', detail: origin, debug: 2, message: reason },
    { errorMessage: 'Missing MuteMembers permission', error: new Error() },
   );
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.MoveMembers)) {
   return this.createError(
    { guildId: this.guildId, channelId },
    { action: 'delete stage instance', detail: origin, debug: 3, message: reason },
    { errorMessage: 'Missing MoveMembers permission', error: new Error() },
   );
  }

  return this.base
   .delete(channelId, { reason })
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId },
     { action: 'delete stage instance', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
