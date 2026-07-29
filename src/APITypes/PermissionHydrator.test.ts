/* eslint-disable @typescript-eslint/naming-convention */
import assert from 'node:assert';
import { test } from 'node:test';

import { ChannelType, PermissionFlagsBits } from '@discordjs/core';

import PermissionHydrator, { HierarchyVerdict, INDETERMINATE_PERMS } from './PermissionHydrator.js';

const basePerms = PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages;

const guildPayload = {
 id: 'G',
 owner_id: 'O',
 roles: [{ id: 'G', permissions: String(basePerms) }],
};
const memberPayload = { user: { id: 'B' }, roles: [] };
const channelPayload = {
 id: 'C',
 type: ChannelType.GuildText,
 guild_id: 'G',
 permission_overwrites: [],
};
const threadPayload = { id: 'T', type: ChannelType.PublicThread, guild_id: 'G', parent_id: 'C' };

const fakeCache = () => {
 const channels = new Map<string, unknown>();
 const threads = new Map<string, unknown>();
 const members = new Map<string, unknown>();
 const guilds = new Map<string, unknown>();
 const roles = new Map<string, unknown[]>();

 return {
  channels: {
   get: async (id: string) => channels.get(id) ?? null,
   set: async (c: { id: string }) => channels.set(c.id, c),
  },
  threads: {
   get: async (id: string) => threads.get(id) ?? null,
   set: async (t: { id: string }) => threads.set(t.id, t),
  },
  members: {
   get: async (g: string, u: string) => members.get(`${g}:${u}`) ?? null,
   set: async (m: { user: { id: string }; roles: string[] }, g: string) =>
    members.set(`${g}:${m.user.id}`, { ...m, guild_id: g, user_id: m.user.id }),
  },
  guilds: {
   get: async (id: string) => guilds.get(id) ?? null,
   set: async (g: { id: string }) => guilds.set(g.id, g),
  },
  roles: {
   getAll: async (g: string) => roles.get(g) ?? [],
   set: async (r: unknown, g: string) => roles.set(g, [...(roles.get(g) ?? []), r]),
  },
 };
};

const hydratorWith = (
 cache: ReturnType<typeof fakeCache>,
 raw: {
  guild?: unknown;
  member?: unknown;
  members?: Record<string, unknown>;
  rolesList?: unknown[];
  channels?: Record<string, unknown>;
 },
) => {
 const h = new PermissionHydrator(cache as never, {} as never);
 h.guilds = {
  get: async () => {
   if (!raw.guild) throw new Error('unexpected guild fetch');
   return raw.guild;
  },
  getMember: async (_guildId: string, userId: string) => {
   const found = raw.members?.[userId] ?? raw.member;
   if (!found) throw new Error('unexpected member fetch');
   return found;
  },
  getRoles: async () => {
   if (!raw.rolesList) throw new Error('unexpected roles fetch');
   return raw.rolesList;
  },
 } as never;
 h.channels = {
  get: async (id: string) => {
   const found = raw.channels?.[id];
   if (!found) throw new Error('unexpected channel fetch');
   return found;
  },
 } as never;
 return h;
};

test('cold cache: fetches entities, writes them, computes real perms', async () => {
 const cache = fakeCache();
 const h = hydratorWith(cache, {
  guild: guildPayload,
  member: memberPayload,
  channels: { C: channelPayload },
 });

 assert.strictEqual(await h.channelPerms('G', 'B', 'C'), basePerms);
 assert.ok(await cache.members.get('G', 'B'));
 assert.ok(await cache.guilds.get('G'));
 assert.ok((await cache.roles.getAll('G')).length);
});

test('member fetch fails: returns INDETERMINATE_PERMS so the attempt is allowed', async () => {
 const cache = fakeCache();
 const h = hydratorWith(cache, { guild: guildPayload, channels: { C: channelPayload } });

 assert.strictEqual(await h.channelPerms('G', 'B', 'C'), INDETERMINATE_PERMS);
});

test('warm cache: computes without fetching', async () => {
 const cache = fakeCache();
 await cache.channels.set(channelPayload);
 await cache.members.set(memberPayload, 'G');
 await cache.guilds.set(guildPayload);
 await cache.roles.set(guildPayload.roles[0], 'G');
 const h = hydratorWith(cache, {});

 assert.strictEqual(await h.channelPerms('G', 'B', 'C'), basePerms);
});

test('uncached thread: caches thread and parent, computes via parent', async () => {
 const cache = fakeCache();
 const h = hydratorWith(cache, {
  guild: guildPayload,
  member: memberPayload,
  channels: { T: threadPayload, C: channelPayload },
 });

 assert.strictEqual(await h.channelPerms('G', 'B', 'T'), basePerms);
 assert.ok(await cache.threads.get('T'));
 assert.ok(await cache.channels.get('C'));
});

test('guildPerms cold cache: computes from fetched guild and roles', async () => {
 const cache = fakeCache();
 const h = hydratorWith(cache, { guild: guildPayload, member: memberPayload });

 assert.strictEqual(await h.guildPerms('G', 'B'), basePerms);
});

const hierarchyGuild = {
 id: 'G',
 owner_id: 'O',
 roles: [
  { id: 'G', permissions: '0', position: 0 },
  { id: 'RHigh', permissions: '0', position: 5 },
  { id: 'RLow', permissions: '0', position: 1 },
 ],
};
const highMember = { user: { id: 'E' }, roles: ['RHigh'] };
const lowMember = { user: { id: 'T' }, roles: ['RLow'] };

test('roleHierarchy cold cache: executor above target', async () => {
 const cache = fakeCache();
 const h = hydratorWith(cache, { guild: hierarchyGuild, members: { E: highMember, T: lowMember } });

 assert.strictEqual(await h.roleHierarchy('G', 'E', 'T'), HierarchyVerdict.Above);
});

test('roleHierarchy cold cache: executor below target', async () => {
 const cache = fakeCache();
 const h = hydratorWith(cache, { guild: hierarchyGuild, members: { E: highMember, T: lowMember } });

 assert.strictEqual(await h.roleHierarchy('G', 'T', 'E'), HierarchyVerdict.NotAbove);
});

test('roleHierarchy: target member fetch fails -> Indeterminate', async () => {
 const cache = fakeCache();
 const h = hydratorWith(cache, { guild: hierarchyGuild, members: { E: highMember } });

 assert.strictEqual(await h.roleHierarchy('G', 'E', 'T'), HierarchyVerdict.Indeterminate);
});
