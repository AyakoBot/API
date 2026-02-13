import type { logger as Logger } from '@ayako/utility';
import { UsersAPI as DiscordUsersAPI, type Snowflake } from '@discordjs/core';

import API from './API.js';

export default class UsersAPI extends API {
 base: DiscordUsersAPI;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super(token, logger, guildId);

  this.base = new DiscordUsersAPI(this.rest);
 }

 get(
  userId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .get(userId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get user', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getCurrent({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getCurrent()
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get current user', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getGuilds(
  query: Parameters<DiscordUsersAPI['getGuilds']>[0],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getGuilds(query)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get current user guilds', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 leaveGuild(
  guildId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .leaveGuild(guildId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'leave guild', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 edit(
  body: Parameters<DiscordUsersAPI['edit']>[0],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .edit(body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'edit current user', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getGuildMember(
  guildId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getGuildMember(guildId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'get current user guild member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 editCurrentGuildMember(
  guildId: Snowflake,
  body: Parameters<DiscordUsersAPI['editCurrentGuildMember']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .editCurrentGuildMember(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'edit current guild member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 createDM(
  userId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .createDM(userId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'create DM', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getConnections({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getConnections()
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get user connections', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getApplicationRoleConnection({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getApplicationRoleConnection(this.appId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get application role connection', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 updateApplicationRoleConnection(
  body: Parameters<DiscordUsersAPI['updateApplicationRoleConnection']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .updateApplicationRoleConnection(this.appId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'update application role connection', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
