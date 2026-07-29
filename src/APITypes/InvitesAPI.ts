import { type Cache, type logger as Logger } from '@ayako/utility';
import { InvitesAPI as DiscordInvitesAPI, PermissionFlagsBits } from '@discordjs/core';

import API from './API.js';
import PermissionHydrator from './PermissionHydrator.js';

export default class InvitesAPI extends API {
 base: DiscordInvitesAPI;
 private cache: Cache;
 private hydrator: PermissionHydrator;

 constructor(token: string, logger: typeof Logger, guildId: string, cache: Cache) {
  super(token, logger, guildId);

  this.base = new DiscordInvitesAPI(this.rest);
  this.cache = cache;
  this.hydrator = new PermissionHydrator(cache, this.rest);
 }

 get(
  code: string,
  query: Parameters<DiscordInvitesAPI['get']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .get(code, query)
   .then((res) => {
    this.cache.invites.set(res);
    return this.cache.invites.apiToR(res);
   })
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
   const perms = await this.hydrator.channelPerms(this.guildId, this.appId, channelId);

   if (!API.hasPerm(perms, PermissionFlagsBits.ManageChannels)) {
    return this.createError(
     { inviteCode: code },
     { action: 'delete invite', detail: origin, debug: 1, message: reason },
     { errorMessage: 'Missing ManageChannels permission', error: new Error() },
    );
   }
  } else {
   const perms = await this.hydrator.guildPerms(this.guildId, this.appId);

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
