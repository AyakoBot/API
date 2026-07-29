import { getChannelPerms, getGuildPerms, getRoleHierarchy, type Cache } from '@ayako/utility';
import {
 ChannelType,
 ChannelsAPI as DiscordChannelsAPI,
 GuildsAPI as DiscordGuildsAPI,
 type APIThreadChannel,
 type Snowflake,
} from '@discordjs/core';
import type { REST } from '@discordjs/rest';

export const INDETERMINATE_PERMS = ~0n;

export enum HierarchyVerdict {
 Above = 'above',
 NotAbove = 'notAbove',
 Indeterminate = 'indeterminate',
}

const threadTypes = [
 ChannelType.AnnouncementThread,
 ChannelType.PublicThread,
 ChannelType.PrivateThread,
];

export default class PermissionHydrator {
 cache: Cache;
 guilds: Pick<DiscordGuildsAPI, 'get' | 'getMember' | 'getRoles'>;
 channels: Pick<DiscordChannelsAPI, 'get'>;

 constructor(cache: Cache, rest: REST) {
  this.cache = cache;
  this.guilds = new DiscordGuildsAPI(rest);
  this.channels = new DiscordChannelsAPI(rest);
 }

 async guildPerms(guildId: Snowflake, userId: Snowflake): Promise<bigint> {
  if (!(await this.ensureGuildEntities(guildId, userId))) return INDETERMINATE_PERMS;

  return (await getGuildPerms.call(this.cache, guildId, userId)).response;
 }

 async roleHierarchy(
  guildId: Snowflake,
  executorId: Snowflake,
  targetId: Snowflake,
 ): Promise<HierarchyVerdict> {
  const [executorKnown, targetKnown] = await Promise.all([
   this.ensureGuildEntities(guildId, executorId),
   this.ensureMember(guildId, targetId),
  ]);
  if (!executorKnown || !targetKnown) return HierarchyVerdict.Indeterminate;

  const { response } = await getRoleHierarchy.call(this.cache, guildId, executorId, targetId);
  return response ? HierarchyVerdict.Above : HierarchyVerdict.NotAbove;
 }

 async channelPerms(guildId: Snowflake, userId: Snowflake, channelId: Snowflake): Promise<bigint> {
  const [channelKnown, guildKnown] = await Promise.all([
   this.ensureChannel(channelId),
   this.ensureGuildEntities(guildId, userId),
  ]);
  if (!channelKnown || !guildKnown) return INDETERMINATE_PERMS;

  return (await getChannelPerms.call(this.cache, guildId, userId, channelId)).allow;
 }

 private async ensureGuildEntities(guildId: Snowflake, userId: Snowflake): Promise<boolean> {
  const [memberKnown, guildKnown] = await Promise.all([
   this.ensureMember(guildId, userId),
   this.ensureGuild(guildId),
  ]);

  return memberKnown && guildKnown && (await this.ensureRoles(guildId));
 }

 private async ensureMember(guildId: Snowflake, userId: Snowflake): Promise<boolean> {
  if (await this.cache.members.get(guildId, userId)) return true;

  const fetched = await this.guilds.getMember(guildId, userId).catch(() => null);
  if (!fetched) return false;

  await this.cache.members.set(fetched, guildId);
  return true;
 }

 private async ensureGuild(guildId: Snowflake): Promise<boolean> {
  if (await this.cache.guilds.get(guildId)) return true;

  const fetched = await this.guilds.get(guildId).catch(() => null);
  if (!fetched) return false;

  await this.cache.guilds.set(fetched);
  await Promise.all(fetched.roles.map((role) => this.cache.roles.set(role, guildId)));
  return true;
 }

 private async ensureRoles(guildId: Snowflake): Promise<boolean> {
  if ((await this.cache.roles.getAll(guildId)).length) return true;

  const fetched = await this.guilds.getRoles(guildId).catch(() => null);
  if (!fetched) return false;

  await Promise.all(fetched.map((role) => this.cache.roles.set(role, guildId)));
  return true;
 }

 private async ensureChannel(channelId: Snowflake): Promise<boolean> {
  if (await this.cache.channels.get(channelId)) return true;

  const cachedThread = await this.cache.threads.get(channelId);
  if (cachedThread) return this.ensureParent(cachedThread.parent_id);

  const fetched = await this.channels.get(channelId).catch(() => null);
  if (!fetched) return false;

  if (threadTypes.includes(fetched.type)) {
   const thread = fetched as APIThreadChannel;
   await this.cache.threads.set(thread);
   return this.ensureParent(thread.parent_id);
  }

  await this.cache.channels.set(fetched as Parameters<Cache['channels']['set']>[0]);
  return true;
 }

 private async ensureParent(parentId: string | null | undefined): Promise<boolean> {
  if (!parentId) return false;
  if (await this.cache.channels.get(parentId)) return true;

  const fetched = await this.channels.get(parentId).catch(() => null);
  if (!fetched) return false;

  await this.cache.channels.set(fetched as Parameters<Cache['channels']['set']>[0]);
  return true;
 }
}
