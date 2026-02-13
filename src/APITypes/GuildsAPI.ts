import type { Cache, logger as Logger } from '@ayako/utility';
import { GuildsAPI as DiscordGuildsAPI, type Snowflake } from '@discordjs/core';

import API from './API.js';
import GuildPermissionsUtility from './GuildPermissionsUtility.js';

export default class GuildsAPI extends API {
 util: GuildPermissionsUtility;
 base: DiscordGuildsAPI;

 constructor(token: string, logger: typeof Logger, guildId: string, cache: Cache) {
  super(token, logger, guildId);

  this.base = new DiscordGuildsAPI(this.rest);
  this.util = new GuildPermissionsUtility(logger, cache, this.appId);
 }

 get(
  guildId: Snowflake,
  query: Parameters<DiscordGuildsAPI['get']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .get(guildId, query)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getPreview(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getPreview(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild preview', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async edit(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['edit']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit guild', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .edit(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit guild', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getChannels(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getChannels(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild channels', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createChannel(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['createChannel']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageChannels(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'create guild channel', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createChannel(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'create guild channel', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async setChannelPositions(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['setChannelPositions']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageChannels(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'set channel positions', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .setChannelPositions(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'set channel positions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getActiveThreads(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getActiveThreads(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get active threads', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getMembers(
  guildId: Snowflake,
  query: Parameters<DiscordGuildsAPI['getMembers']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getMembers(guildId, query)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild members', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getMember(
  guildId: Snowflake,
  userId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getMember(guildId, userId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 searchForMembers(
  guildId: Snowflake,
  query: Parameters<DiscordGuildsAPI['searchForMembers']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .searchForMembers(guildId, query)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'search for guild members', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async addMember(
  guildId: Snowflake,
  userId: Snowflake,
  body: Parameters<DiscordGuildsAPI['addMember']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canAddMember(guildId, body);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'add guild member', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .addMember(guildId, userId, body)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'add guild member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editMember(
  guildId: Snowflake,
  userId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editMember']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canEditMember(guildId, body);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit guild member', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editMember(guildId, userId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit guild member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async removeMember(
  guildId: Snowflake,
  userId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canKickMembers(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'remove guild member', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .removeMember(guildId, userId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'remove guild member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getRoles(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getRoles(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild roles', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getRole(
  guildId: Snowflake,
  roleId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getRole(guildId, roleId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild role', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createRole(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['createRole']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageRoles(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'create guild role', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createRole(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'create guild role', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async setRolePositions(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['setRolePositions']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageRoles(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'set role positions', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .setRolePositions(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'set role positions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editRole(
  guildId: Snowflake,
  roleId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editRole']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageRoles(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit guild role', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editRole(guildId, roleId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit guild role', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteRole(
  guildId: Snowflake,
  roleId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageRoles(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'delete guild role', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteRole(guildId, roleId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'delete guild role', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async addRoleToMember(
  guildId: Snowflake,
  userId: Snowflake,
  roleId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageRoles(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'add role to member', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .addRoleToMember(guildId, userId, roleId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'add role to member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async removeRoleFromMember(
  guildId: Snowflake,
  userId: Snowflake,
  roleId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageRoles(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'remove role from member', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .removeRoleFromMember(guildId, userId, roleId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'remove role from member', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getMemberBan(
  guildId: Snowflake,
  userId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canBanMembers(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get member ban', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getMemberBan(guildId, userId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get member ban', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getMemberBans(
  guildId: Snowflake,
  query: Parameters<DiscordGuildsAPI['getMemberBans']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canBanMembers(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get member bans', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getMemberBans(guildId, query)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get member bans', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async banUser(
  guildId: Snowflake,
  userId: Snowflake,
  body: Parameters<DiscordGuildsAPI['banUser']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canBanMembers(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'ban user', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .banUser(guildId, userId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'ban user', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async unbanUser(
  guildId: Snowflake,
  userId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canBanMembers(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'unban user', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .unbanUser(guildId, userId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'unban user', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async bulkBanUsers(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['bulkBanUsers']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canBulkBanUsers(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'bulk ban users', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .bulkBanUsers(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'bulk ban users', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getPruneCount(
  guildId: Snowflake,
  query: Parameters<DiscordGuildsAPI['getPruneCount']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canKickMembers(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get prune count', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getPruneCount(guildId, query)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get prune count', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async beginPrune(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['beginPrune']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canBeginPrune(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'begin prune', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .beginPrune(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'begin prune', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getVoiceRegions(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getVoiceRegions(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get voice regions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getInvites(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get guild invites', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getInvites(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild invites', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getIntegrations(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get guild integrations', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getIntegrations(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild integrations', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteIntegration(
  guildId: Snowflake,
  integrationId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'delete guild integration', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteIntegration(guildId, integrationId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'delete guild integration', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getWidgetSettings(
  guildId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get widget settings', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getWidgetSettings(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get widget settings', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editWidgetSettings(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editWidgetSettings']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit widget settings', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editWidgetSettings(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit widget settings', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getWidget(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getWidget(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild widget', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getVanityURL(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get vanity URL', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getVanityURL(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get vanity URL', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getWidgetImage(
  guildId: Snowflake,
  style: Parameters<DiscordGuildsAPI['getWidgetImage']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getWidgetImage(guildId, style)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get widget image', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getWelcomeScreen(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getWelcomeScreen(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get welcome screen', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editWelcomeScreen(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editWelcomeScreen']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit welcome screen', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editWelcomeScreen(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit welcome screen', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getEmojis(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getEmojis(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild emojis', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getEmoji(
  guildId: Snowflake,
  emojiId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getEmoji(guildId, emojiId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild emoji', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createEmoji(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['createEmoji']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canCreateGuildExpressions(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'create guild emoji', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createEmoji(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'create guild emoji', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editEmoji(
  guildId: Snowflake,
  emojiId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editEmoji']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuildExpressions(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit guild emoji', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editEmoji(guildId, emojiId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit guild emoji', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteEmoji(
  guildId: Snowflake,
  emojiId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuildExpressions(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'delete guild emoji', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteEmoji(guildId, emojiId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'delete guild emoji', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getScheduledEvents(
  guildId: Snowflake,
  query: Parameters<DiscordGuildsAPI['getScheduledEvents']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getScheduledEvents(guildId, query)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get scheduled events', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getScheduledEvent(
  guildId: Snowflake,
  eventId: Snowflake,
  query: Parameters<DiscordGuildsAPI['getScheduledEvent']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getScheduledEvent(guildId, eventId, query)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get scheduled event', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createScheduledEvent(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['createScheduledEvent']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageEvents(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'create scheduled event', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createScheduledEvent(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'create scheduled event', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editScheduledEvent(
  guildId: Snowflake,
  eventId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editScheduledEvent']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageEvents(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit scheduled event', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editScheduledEvent(guildId, eventId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit scheduled event', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteScheduledEvent(
  guildId: Snowflake,
  eventId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageEvents(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'delete scheduled event', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteScheduledEvent(guildId, eventId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'delete scheduled event', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getScheduledEventUsers(
  guildId: Snowflake,
  eventId: Snowflake,
  query: Parameters<DiscordGuildsAPI['getScheduledEventUsers']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getScheduledEventUsers(guildId, eventId, query)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get scheduled event users', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getTemplate(templateCode: string, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getTemplate(templateCode)
   .catch((err) =>
    this.createError(
     { guildId: templateCode },
     { action: 'get guild template', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getTemplates(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get guild templates', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getTemplates(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild templates', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createTemplate(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['createTemplate']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'create guild template', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createTemplate(guildId, body)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'create guild template', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async syncTemplate(
  guildId: Snowflake,
  templateCode: string,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'sync guild template', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .syncTemplate(guildId, templateCode)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'sync guild template', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editTemplate(
  guildId: Snowflake,
  templateCode: string,
  body: Parameters<DiscordGuildsAPI['editTemplate']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit guild template', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editTemplate(guildId, templateCode, body)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit guild template', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteTemplate(
  guildId: Snowflake,
  templateCode: string,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'delete guild template', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteTemplate(guildId, templateCode)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'delete guild template', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getStickers(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getStickers(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild stickers', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getSticker(
  guildId: Snowflake,
  stickerId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getSticker(guildId, stickerId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild sticker', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createSticker(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['createSticker']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canCreateGuildExpressions(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'create guild sticker', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createSticker(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'create guild sticker', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editSticker(
  guildId: Snowflake,
  stickerId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editSticker']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuildExpressions(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit guild sticker', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editSticker(guildId, stickerId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit guild sticker', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteSticker(
  guildId: Snowflake,
  stickerId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuildExpressions(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'delete guild sticker', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteSticker(guildId, stickerId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'delete guild sticker', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getAuditLogs(
  guildId: Snowflake,
  query: Parameters<DiscordGuildsAPI['getAuditLogs']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canViewAuditLog(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get audit logs', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getAuditLogs(guildId, query)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get audit logs', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getAutoModerationRules(
  guildId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get auto moderation rules', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getAutoModerationRules(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get auto moderation rules', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getAutoModerationRule(
  guildId: Snowflake,
  ruleId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get auto moderation rule', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getAutoModerationRule(guildId, ruleId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get auto moderation rule', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createAutoModerationRule(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['createAutoModerationRule']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    {
     action: 'create auto moderation rule',
     detail: origin,
     debug: can.debug,
     message: reason,
    },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createAutoModerationRule(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'create auto moderation rule', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editAutoModerationRule(
  guildId: Snowflake,
  ruleId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editAutoModerationRule']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit auto moderation rule', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editAutoModerationRule(guildId, ruleId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit auto moderation rule', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteAutoModerationRule(
  guildId: Snowflake,
  ruleId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    {
     action: 'delete auto moderation rule',
     detail: origin,
     debug: can.debug,
     message: reason,
    },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteAutoModerationRule(guildId, ruleId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'delete auto moderation rule', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getWebhooks(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  const can = await this.util.canManageWebhooks(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'get guild webhooks', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getWebhooks(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild webhooks', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getOnboarding(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getOnboarding(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get guild onboarding', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editOnboarding(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editOnboarding']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canEditOnboarding(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit guild onboarding', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editOnboarding(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit guild onboarding', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getSoundboardSounds(guildId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getSoundboardSounds(guildId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get soundboard sounds', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getSoundboardSound(
  guildId: Snowflake,
  soundId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getSoundboardSound(guildId, soundId)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'get soundboard sound', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createSoundboardSound(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['createSoundboardSound']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canCreateGuildExpressions(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'create soundboard sound', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createSoundboardSound(guildId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'create soundboard sound', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editSoundboardSound(
  guildId: Snowflake,
  soundId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editSoundboardSound']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuildExpressions(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit soundboard sound', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editSoundboardSound(guildId, soundId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit soundboard sound', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteSoundboardSound(
  guildId: Snowflake,
  soundId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuildExpressions(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'delete soundboard sound', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteSoundboardSound(guildId, soundId, { reason })
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'delete soundboard sound', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editIncidentActions(
  guildId: Snowflake,
  body: Parameters<DiscordGuildsAPI['editIncidentActions']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canManageGuild(guildId);
  if (!can.response) {
   return this.createError(
    { guildId },
    { action: 'edit incident actions', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editIncidentActions(guildId, body)
   .catch((err) =>
    this.createError(
     { guildId },
     { action: 'edit incident actions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
