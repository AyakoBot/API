import { type Cache, type logger as Logger, getChannelPerms, getGuildPerms } from '@ayako/utility';
import { InvitesAPI as DiscordInvitesAPI, PermissionFlagsBits } from '@discordjs/core';

import API from './API.js';

export default class InvitesAPI extends API {
 base: DiscordInvitesAPI;
 private cache: Cache;

 constructor(token: string, logger: typeof Logger, guildId: string, cache: Cache) {
  super(token, logger, guildId);

  this.base = new DiscordInvitesAPI(this.rest);
  this.cache = cache;
 }

 get(
  code: string,
  query: Parameters<DiscordInvitesAPI['get']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .get(code, query)
   .catch((err) =>
    this.createError(
     { inviteCode: code },
     { action: 'get invite', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async delete(
  channelId: string | undefined,
  code: string,
  { origin, reason }: { origin: string; reason: string },
 ) {
  if (channelId) {
   const { allow: perms } = await getChannelPerms.call(
    this.cache,
    this.guildId,
    this.appId,
    channelId,
   );

   if (!API.hasPerm(perms, PermissionFlagsBits.ManageChannels)) {
    return this.createError(
     { inviteCode: code },
     { action: 'delete invite', detail: origin, debug: 1, message: reason },
     { errorMessage: 'Missing ManageChannels permission', error: new Error() },
    );
   }
  } else {
   const { response: perms } = await getGuildPerms.call(this.cache, this.guildId, this.appId);

   if (!API.hasPerm(perms, PermissionFlagsBits.ManageGuild)) {
    return this.createError(
     { inviteCode: code },
     { action: 'delete invite', detail: origin, debug: 1, message: reason },
     { errorMessage: 'Missing ManageGuild permission', error: new Error() },
    );
   }
  }

  return this.base
   .delete(code, { reason })
   .catch((err) =>
    this.createError(
     { inviteCode: code },
     { action: 'delete invite', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
