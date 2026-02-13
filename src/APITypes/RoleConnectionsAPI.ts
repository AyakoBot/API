import type { logger as Logger } from '@ayako/utility';
import { RoleConnectionsAPI as DiscordRoleConnectionsAPI } from '@discordjs/core';

import API from './API.js';

export default class RoleConnectionsAPI extends API {
 base: DiscordRoleConnectionsAPI;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super(token, logger, guildId);

  this.base = new DiscordRoleConnectionsAPI(this.rest);
 }

 getMetadataRecords({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getMetadataRecords(this.appId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get role connection metadata records', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 updateMetadataRecords(
  body: Parameters<DiscordRoleConnectionsAPI['updateMetadataRecords']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .updateMetadataRecords(this.appId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'update role connection metadata records', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
