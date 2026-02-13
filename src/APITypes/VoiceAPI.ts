import { type Cache, type logger as Logger, getChannelPerms } from '@ayako/utility';
import {
 VoiceAPI as DiscordVoiceAPI,
 PermissionFlagsBits,
 type Snowflake,
} from '@discordjs/core';

import API from './API.js';

export default class VoiceAPI extends API {
 base: DiscordVoiceAPI;
 private cache: Cache;

 constructor(token: string, logger: typeof Logger, guildId: string, cache: Cache) {
  super(token, logger, guildId);

  this.base = new DiscordVoiceAPI(this.rest);
  this.cache = cache;
 }

 getVoiceRegions({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getVoiceRegions()
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get voice regions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getUserVoiceState(
  userId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getUserVoiceState(this.guildId, userId)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId },
     { action: 'get user voice state', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getVoiceState({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getVoiceState(this.guildId)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId },
     { action: 'get current user voice state', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editUserVoiceState(
  userId: Snowflake,
  body: Parameters<DiscordVoiceAPI['editUserVoiceState']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const { allow: perms } = await getChannelPerms.call(
   this.cache,
   this.guildId,
   this.appId,
   body.channel_id,
  );

  if (!API.hasPerm(perms, PermissionFlagsBits.MuteMembers)) {
   return this.createError(
    { guildId: this.guildId, channelId: body.channel_id },
    { action: 'edit user voice state', detail: origin, debug: 1, message: reason },
    { errorMessage: 'Missing MuteMembers permission', error: new Error() },
   );
  }

  return this.base
   .editUserVoiceState(this.guildId, userId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId: this.guildId, channelId: body.channel_id },
     { action: 'edit user voice state', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editVoiceState(
  body: Parameters<DiscordVoiceAPI['editVoiceState']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  if (body?.request_to_speak_timestamp && body.channel_id) {
   const { allow: perms } = await getChannelPerms.call(
    this.cache,
    this.guildId,
    this.appId,
    body.channel_id,
   );

   if (!API.hasPerm(perms, PermissionFlagsBits.RequestToSpeak)) {
    return this.createError(
     { guildId: this.guildId, channelId: body.channel_id },
     { action: 'edit current user voice state', detail: origin, debug: 1, message: reason },
     { errorMessage: 'Missing RequestToSpeak permission', error: new Error() },
    );
   }
  }

  return this.base
   .editVoiceState(this.guildId, body)
   .catch((err) =>
    this.createError(
     { guildId: this.guildId },
     { action: 'edit current user voice state', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
