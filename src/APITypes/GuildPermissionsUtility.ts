import { type Cache, type logger as Logger } from '@ayako/utility';
import { type GuildsAPI, PermissionFlagsBits } from '@discordjs/core';
import type { REST } from '@discordjs/rest';
import type { GuildFeature } from 'discord-api-types/v10';

import API from './API.js';
import PermissionHydrator, { HierarchyVerdict } from './PermissionHydrator.js';

// todo: switch to djs GuildFeature once implemented
const pruneRequiresAdmin = 'PRUNE_REQUIRES_ADMIN' as GuildFeature;

type Disallowed = { response: false; debug: number; message: string };
type Allowed = { response: true; debug: number };

export default class GuildPermissionsUtility {
 logger: typeof Logger;
 cache: Cache;
 botId: string;
 hydrator: PermissionHydrator;

 constructor(logger: typeof Logger, cache: Cache, botId: string, rest: REST) {
  this.logger = logger;
  this.cache = cache;
  this.botId = botId;
  this.hydrator = new PermissionHydrator(cache, rest);
 }

 async canManageGuild(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageGuild)) {
   return { response: false, debug: 1, message: 'Missing ManageGuild permission' };
  }

  return { response: true, debug: 2 };
 }

 async canManageChannels(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageChannels)) {
   return { response: false, debug: 1, message: 'Missing ManageChannels permission' };
  }

  return { response: true, debug: 2 };
 }

 async canBanMembers(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.BanMembers)) {
   return { response: false, debug: 1, message: 'Missing BanMembers permission' };
  }

  return { response: true, debug: 2 };
 }

 async canKickMembers(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.KickMembers)) {
   return { response: false, debug: 1, message: 'Missing KickMembers permission' };
  }

  return { response: true, debug: 2 };
 }

 async canManageRoles(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageRoles)) {
   return { response: false, debug: 1, message: 'Missing ManageRoles permission' };
  }

  return { response: true, debug: 2 };
 }

 async canManageWebhooks(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageWebhooks)) {
   return { response: false, debug: 1, message: 'Missing ManageWebhooks permission' };
  }

  return { response: true, debug: 2 };
 }

 async canViewAuditLog(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewAuditLog)) {
   return { response: false, debug: 1, message: 'Missing ViewAuditLog permission' };
  }

  return { response: true, debug: 2 };
 }

 async canManageGuildExpressions(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (
   !API.hasPerm(perms, PermissionFlagsBits.ManageGuildExpressions) &&
   !API.hasPerm(perms, PermissionFlagsBits.CreateGuildExpressions)
  ) {
   return {
    response: false,
    debug: 1,
    message: 'Missing ManageGuildExpressions or CreateGuildExpressions permission',
   };
  }

  return { response: true, debug: 2 };
 }

 async canCreateGuildExpressions(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.CreateGuildExpressions)) {
   return { response: false, debug: 1, message: 'Missing CreateGuildExpressions permission' };
  }

  return { response: true, debug: 2 };
 }

 async canManageEvents(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageEvents)) {
   return { response: false, debug: 1, message: 'Missing ManageEvents permission' };
  }

  return { response: true, debug: 2 };
 }

 async canBulkBanUsers(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.BanMembers)) {
   return { response: false, debug: 1, message: 'Missing BanMembers permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageGuild)) {
   return { response: false, debug: 2, message: 'Missing ManageGuild permission' };
  }

  return { response: true, debug: 3 };
 }

 async canPrune(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);
  const guild = await this.cache.guilds.get(guildId);

  if (guild?.features?.includes(pruneRequiresAdmin)) {
   if (!API.hasPerm(perms, PermissionFlagsBits.Administrator)) {
    return { response: false, debug: 1, message: 'Missing Administrator permission' };
   }

   return { response: true, debug: 2 };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.KickMembers)) {
   return { response: false, debug: 3, message: 'Missing KickMembers permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageGuild)) {
   return { response: false, debug: 4, message: 'Missing ManageGuild permission' };
  }

  return { response: true, debug: 5 };
 }

 async canEditOnboarding(guildId: string): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageGuild)) {
   return { response: false, debug: 1, message: 'Missing ManageGuild permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageRoles)) {
   return { response: false, debug: 2, message: 'Missing ManageRoles permission' };
  }

  return { response: true, debug: 3 };
 }

 async canAddMember(
  guildId: string,
  body: Parameters<GuildsAPI['addMember']>[2],
 ): Promise<Disallowed | Allowed> {
  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (!API.hasPerm(perms, PermissionFlagsBits.CreateInstantInvite)) {
   return { response: false, debug: 1, message: 'Missing CreateInstantInvite permission' };
  }

  if (body.nick !== undefined && !API.hasPerm(perms, PermissionFlagsBits.ManageNicknames)) {
   return { response: false, debug: 2, message: 'Missing ManageNicknames permission' };
  }

  if (body.roles !== undefined && !API.hasPerm(perms, PermissionFlagsBits.ManageRoles)) {
   return { response: false, debug: 3, message: 'Missing ManageRoles permission' };
  }

  if (body.mute !== undefined && !API.hasPerm(perms, PermissionFlagsBits.MuteMembers)) {
   return { response: false, debug: 4, message: 'Missing MuteMembers permission' };
  }

  if (body.deaf !== undefined && !API.hasPerm(perms, PermissionFlagsBits.DeafenMembers)) {
   return { response: false, debug: 5, message: 'Missing DeafenMembers permission' };
  }

  return { response: true, debug: 6 };
 }

 async canEditMember(
  guildId: string,
  body: Parameters<GuildsAPI['editMember']>[2],
  userId: string,
 ): Promise<Disallowed | Allowed> {
  const hierarchy = await this.hydrator.roleHierarchy(guildId, this.botId, userId);
  if (hierarchy === HierarchyVerdict.NotAbove) {
   return { response: false, debug: 0, message: 'Bot role <= target user role' };
  }

  const perms = await this.hydrator.guildPerms(guildId, this.botId);

  if (body?.nick !== undefined && !API.hasPerm(perms, PermissionFlagsBits.ManageNicknames)) {
   return { response: false, debug: 1, message: 'Missing ManageNicknames permission' };
  }

  if (body?.roles !== undefined && !API.hasPerm(perms, PermissionFlagsBits.ManageRoles)) {
   return { response: false, debug: 2, message: 'Missing ManageRoles permission' };
  }

  if (body?.mute !== undefined && !API.hasPerm(perms, PermissionFlagsBits.MuteMembers)) {
   return { response: false, debug: 3, message: 'Missing MuteMembers permission' };
  }

  if (body?.deaf !== undefined && !API.hasPerm(perms, PermissionFlagsBits.DeafenMembers)) {
   return { response: false, debug: 4, message: 'Missing DeafenMembers permission' };
  }

  if (body?.channel_id !== undefined && !API.hasPerm(perms, PermissionFlagsBits.MoveMembers)) {
   return { response: false, debug: 5, message: 'Missing MoveMembers permission' };
  }

  if (
   body?.communication_disabled_until !== undefined &&
   !API.hasPerm(perms, PermissionFlagsBits.ModerateMembers)
  ) {
   return { response: false, debug: 6, message: 'Missing ModerateMembers permission' };
  }

  return { response: true, debug: 7 };
 }
}
