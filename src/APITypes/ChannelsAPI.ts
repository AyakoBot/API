import type { Cache, logger as Logger } from '@ayako/utility';
import {
 ChannelType,
 ChannelsAPI as DiscordChannelsAPI,
 GuildFeature,
 type RESTGetAPIChannelMessageReactionUsersQuery,
 type RESTGetAPIChannelMessagesQuery,
 type RESTGetAPIChannelThreadsArchivedQuery,
 type RESTPatchAPIChannelJSONBody,
 type RESTPostAPIChannelInviteJSONBody,
 type RESTPostAPIChannelThreadsJSONBody,
 type RESTPostAPIChannelWebhookJSONBody,
 type RESTPutAPIChannelPermissionJSONBody,
 type Snowflake,
} from '@discordjs/core';

import type { EmojiResolvable } from '../types/index.js';

import API from './API.js';
import PermissionUtility from './ChannelPermissionsUtility.js';

export default class ChannelsAPI extends API {
 util: PermissionUtility;
 base: DiscordChannelsAPI;

 constructor(token: string, logger: typeof Logger, guildId: string, cache: Cache) {
  super(token, logger, guildId);

  this.base = new DiscordChannelsAPI(this.rest);
  this.util = new PermissionUtility(logger, cache, this.appId);
 }

 // TODO: validators for payloads. Create and edit message

 async createMessage(
  channelId: Snowflake,
  message: Parameters<DiscordChannelsAPI['createMessage']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'create message', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  const guildId = channel.guild_id;
  if (!guildId) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'create message', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to send message to a channel that is not in a guild via createMessage API method. Use createDirectMessage for DMs instead.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canCreateMessage(guildId, channelId, message);
  if (!can.response) {
   return this.createError(
    { guildId, channelId },
    { action: 'create message', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createMessage(channelId, message)
   .catch((err) =>
    this.createError(
     { guildId, channelId },
     { action: 'create message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  message: Parameters<DiscordChannelsAPI['editMessage']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const msg = await this.util.cache.messages.get(messageId);
  const channel = await this.util.cache.channels.get(channelId);

  if ((!msg || !msg.channel_id) && (!channel || !channel.guild_id)) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'edit message', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to send message to a channel that is not in a guild via editMessage API method. Use editDirectMessage for DMs instead.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canEditMessage(
   (msg?.guild_id || channel?.guild_id)!,
   channelId,
   msg?.author_id,
  );

  if (!can.response) {
   return this.createError(
    { guildId: msg?.guild_id || channel?.guild_id, channelId },
    { action: 'edit message', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editMessage(channelId, messageId, message)
   .catch((err) =>
    this.createError(
     { guildId: msg?.guild_id || channel?.guild_id, channelId },
     { action: 'edit message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getMessageReactions(
  channelId: Snowflake,
  messageId: Snowflake,
  emoji: EmojiResolvable,
  query: RESTGetAPIChannelMessageReactionUsersQuery,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get message reactions', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  const can = await this.util.canGetMessageReactions(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'get message reactions', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getMessageReactions(channelId, messageId, emoji, query)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'get message reactions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteMessageReaction(
  channelId: Snowflake,
  messageId: Snowflake,
  emoji: EmojiResolvable,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'delete message reaction', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  const can = await this.util.canDeleteMessageReaction(
   channel.guild_id,
   channelId,
   messageId,
   emoji,
  );
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'delete own message reaction', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteOwnMessageReaction(channelId, messageId, emoji)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'delete own message reaction', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteAllMessageReactions(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'delete all message reactions', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  const can = await this.util.canDeleteAllMessageReactions(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'delete all message reactions', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteAllMessageReactions(channelId, messageId)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'delete all message reactions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteAllMessageReactionsForEmoji(
  channelId: Snowflake,
  messageId: Snowflake,
  emoji: EmojiResolvable,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'delete all message reactions for emoji', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  const can = await this.util.canDeleteAllMessageReactionsForEmoji(channel.guild_id, channelId);

  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    {
     action: 'delete all message reactions for emoji',
     detail: origin,
     debug: can.debug,
     message: reason,
    },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base.deleteAllMessageReactionsForEmoji(channelId, messageId, emoji).catch((err) =>
   this.createError(
    { guildId: channel.guild_id, channelId },
    {
     action: 'delete all message reactions for emoji',
     detail: origin,
     debug: -1,
     message: reason,
    },
    { errorMessage: err.message, error: err },
   ),
  );
 }

 async addMessageReaction(
  guildId: Snowflake,
  channelId: Snowflake,
  messageId: Snowflake,
  emoji: EmojiResolvable,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const can = await this.util.canAddMessageReaction(guildId, channelId, emoji);
  if (!can.response) {
   return this.createError(
    { guildId, channelId },
    { action: 'add message reaction', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .addMessageReaction(channelId, messageId, emoji)
   .catch((err) =>
    this.createError(
     { guildId, channelId },
     { action: 'add message reaction', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 get(channelId: Snowflake) {
  return (
   this.base.get(channelId) ||
   this.util.cache.channels
    .get(channelId)
    .then((r) => (r ? this.util.cache.channels.apiToR(r) : undefined))
  );
 }

 async edit(
  channelId: Snowflake,
  body: RESTPatchAPIChannelJSONBody,
  { reason, origin }: { reason: string; origin: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'edit channel', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
   return;
  }

  const can = await this.util.canEdit(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
   return;
  }

  if (body.name && body.name.length > 100) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 1, message: reason },
    { errorMessage: 'Channel name must be between 1 and 100 characters', error: new Error() },
   );
   return;
  }

  if (body.type) {
   const guild = await this.util.cache.guilds.get(channel.guild_id);
   if (
    guild &&
    !guild.features.includes(GuildFeature.News) &&
    body.type === ChannelType.GuildAnnouncement
   ) {
    return this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'edit channel', detail: origin, debug: 2, message: reason },
     {
      errorMessage:
       'Guild does not have the News feature, cannot change channel type to GuildAnnouncement.',
      error: new Error(),
     },
    );
    return;
   }

   if (![ChannelType.GuildAnnouncement, ChannelType.GuildText].includes(body.type)) {
    return this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'edit channel', detail: origin, debug: 3, message: reason },
     {
      errorMessage: 'Invalid channel type. Only GuildText and GuildAnnouncement are allowed.',
      error: new Error(),
     },
    );
    return;
   }
  }

  if (body.topic) {
   if (
    [ChannelType.GuildMedia, ChannelType.GuildForum].includes(channel.type) &&
    body.topic.length > 4096
   ) {
    return this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'edit channel', detail: origin, debug: 4, message: reason },
     {
      errorMessage:
       'Channel topic must be between 0 and 4096 characters for Media and Forum channels.',
      error: new Error(),
     },
    );
    return;
   }

   if (body.topic.length > 1024) {
    return this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'edit channel', detail: origin, debug: 5, message: reason },
     {
      errorMessage: 'Channel topic must be between 0 and 1024 characters.',
      error: new Error(),
     },
    );
    return;
   }
  }

  if (
   ![
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
    ChannelType.GuildStageVoice,
   ].includes(channel.type) &&
   typeof body.nsfw === 'boolean'
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 6, message: reason },
    {
     errorMessage:
      'NSFW property can only be set for Text, Voice, Announcement, Stage, Forum and Media channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![
    ChannelType.GuildText,
    ChannelType.AnnouncementThread,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
    ChannelType.GuildStageVoice,
   ].includes(channel.type) &&
   typeof body.rate_limit_per_user === 'number'
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage:
      'Rate limit per user can only be set for Text, Stage, Thread-type and Forum and Media channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(channel.type) &&
   typeof body.bitrate === 'number'
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Bitrate can only be set for Voice and Stage channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (![ChannelType.GuildVoice].includes(channel.type) && typeof body.user_limit === 'number') {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'User limit can only be set for Voice channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   [ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread].includes(
    channel.type,
   ) &&
   Array.isArray(body.permission_overwrites)
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Permission overwrites cannot be set for Thread-type channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.AnnouncementThread,
    ChannelType.GuildStageVoice,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
   ].includes(channel.type) &&
   !!body.parent_id
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage:
      'Parent can only be set for Text, Voice, Announcement, Stage Voice, Forum, and Media channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (![ChannelType.GuildVoice].includes(channel.type) && !!body.rtc_region) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'RTC region can only be set for Voice channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(channel.type) &&
   !!body.video_quality_mode
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Video quality mode can only be set for Voice and Stage channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread].includes(
    channel.type,
   ) &&
   !!body.archived
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Archived can only be set for Thread-type channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread].includes(
    channel.type,
   ) &&
   !!body.auto_archive_duration
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Auto archive duration can only be set for Thread-type channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
   ].includes(channel.type) &&
   !!body.default_auto_archive_duration
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage:
      'Default auto archive duration can only be set for Text, Announcement, Forum, and Media channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread].includes(
    channel.type,
   ) &&
   typeof body.locked === 'boolean'
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Locked can only be set for Thread-type channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![ChannelType.GuildForum, ChannelType.GuildMedia].includes(channel.type) &&
   !!body.available_tags
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Available tags can only be set for Forum and Media channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (![ChannelType.PrivateThread].includes(channel.type) && typeof body.invitable === 'boolean') {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Invitable can only be set for Private Thread channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![ChannelType.GuildForum, ChannelType.GuildMedia].includes(channel.type) &&
   !!body.default_reaction_emoji
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Default reaction emoji can only be set for Forum and Media channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![ChannelType.GuildForum, ChannelType.GuildMedia, ChannelType.GuildText].includes(
    channel.type,
   ) &&
   !!body.default_thread_rate_limit_per_user
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage:
      'Default thread rate limit per user can only be set for Forum, Media, and Text channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![ChannelType.GuildForum, ChannelType.GuildMedia].includes(channel.type) &&
   !!body.default_sort_order
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Default sort order can only be set for Forum and Media channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (![ChannelType.GuildForum].includes(channel.type) && !!body.default_forum_layout) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Default forum layout can only be set for Forum channels.',
     error: new Error(),
    },
   );
   return;
  }

  if (
   ![ChannelType.GuildForum, ChannelType.GuildMedia].includes(channel.type) &&
   !!body.applied_tags
  ) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit channel', detail: origin, debug: 7, message: reason },
    {
     errorMessage: 'Applied tags can only be set for Forum and Media channels.',
     error: new Error(),
    },
   );
   return;
  }

  return this.base
   .edit(channelId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'edit channel', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getMessages(
  channelId: Snowflake,
  query: RESTGetAPIChannelMessagesQuery | undefined,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get messages', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  const can = await this.util.canGetMessages(channel.guild_id!, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id!, channelId },
    { action: 'get messages', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getMessages(channelId, query)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id!, channelId },
     { action: 'get messages', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async showTyping(channelId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'show typing', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  const can = await this.util.canShowTyping(channel.guild_id!, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id!, channelId },
    { action: 'show typing', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .showTyping(channelId)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id!, channelId },
     { action: 'show typing', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getPins(channelId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get pins', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get pins', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to get pins for a channel that is not in a guild via getPins API method. Use getDirectMessagePins for DMs instead.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canGetPins(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'get pins', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getPins(channelId)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'get pins', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async pinMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'pin message', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'pin message', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to pin a message in a channel that is not in a guild via pinMessage API method. Use pinDirectMessage for DMs instead.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canPinMessage(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'pin message', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .pinMessage(channelId, messageId, { reason })
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'pin message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async unpinMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'unpin message', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'unpin message', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to unpin a message in a channel that is not in a guild via unpinMessage API method. Use unpinDirectMessage for DMs instead.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canUnpinMessage(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'unpin message', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .unpinMessage(channelId, messageId, { reason })
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'unpin message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deleteMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const msg = await this.util.cache.messages.get(messageId);
  const channel = await this.util.cache.channels.get(channelId);

  if ((!msg || !msg.channel_id) && (!channel || !channel.guild_id)) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'delete message', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to delete a message in a channel that is not in a guild via deleteMessage API method. Use deleteDirectMessage for DMs instead.',
     error: new Error(),
    },
   );
  }

  const guildId = (msg?.guild_id || channel?.guild_id)!;

  const can = await this.util.canDeleteMessage(guildId, channelId, msg?.author_id);
  if (!can.response) {
   return this.createError(
    { guildId, channelId },
    { action: 'delete message', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deleteMessage(channelId, messageId, { reason })
   .catch((err) =>
    this.createError(
     { guildId, channelId },
     { action: 'delete message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async bulkDeleteMessages(
  channelId: Snowflake,
  messageIds: Snowflake[],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'bulk delete messages', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'bulk delete messages', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to bulk delete messages in a channel that is not in a guild via bulkDeleteMessages API method. Use bulkDeleteDirectMessages for DMs instead.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canBulkDeleteMessages(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'bulk delete messages', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .bulkDeleteMessages(channelId, messageIds, { reason })
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'bulk delete messages', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get message', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get message', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to get a message in a channel that is not in a guild via getMessage API method. Use getDirectMessage for DMs instead.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canGetMessages(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'get message', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getMessage(channelId, messageId)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'get message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async crosspostMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'crosspost message', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'crosspost message', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to crosspost a message in a channel that is not in a guild via crosspostMessage API method.',
     error: new Error(),
    },
   );
  }

  const msg = await this.util.cache.messages.get(messageId);

  const can = await this.util.canCrosspostMessage(channel.guild_id, channelId, msg?.author_id);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'crosspost message', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .crosspostMessage(channelId, messageId)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'crosspost message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async followAnnouncements(
  channelId: Snowflake,
  webhookChannelId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const webhookChannel = await this.util.cache.channels.get(webhookChannelId);
  if (!webhookChannel) {
   return this.createError(
    { guildId: undefined, channelId: webhookChannelId },
    { action: 'follow announcements', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Webhook target channel not found in cache', error: new Error() },
   );
  }

  if (!webhookChannel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId: webhookChannelId },
    { action: 'follow announcements', detail: origin, debug: 0, message: reason },
    {
     errorMessage: 'Webhook target channel is not in a guild.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canFollowAnnouncements(webhookChannel.guild_id, webhookChannelId);
  if (!can.response) {
   return this.createError(
    { guildId: webhookChannel.guild_id, channelId: webhookChannelId },
    { action: 'follow announcements', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .followAnnouncements(channelId, webhookChannelId, { reason })
   .catch((err) =>
    this.createError(
     { guildId: webhookChannel.guild_id, channelId: webhookChannelId },
     { action: 'follow announcements', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createInvite(
  channelId: Snowflake,
  body: RESTPostAPIChannelInviteJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'create invite', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'create invite', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to create an invite for a channel that is not in a guild via createInvite API method.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canCreateInvite(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'create invite', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createInvite(channelId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'create invite', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getInvites(channelId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get invites', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get invites', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to get invites for a channel that is not in a guild via getInvites API method.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canGetInvites(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'get invites', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getInvites(channelId)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'get invites', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createThread(
  channelId: Snowflake,
  body: RESTPostAPIChannelThreadsJSONBody,
  messageId: Snowflake | undefined,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'create thread', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'create thread', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to create a thread in a channel that is not in a guild via createThread API method.',
     error: new Error(),
    },
   );
  }

  const isPrivate = !messageId && body.type === ChannelType.PrivateThread;
  const can = await this.util.canCreateThread(channel.guild_id, channelId, isPrivate);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'create thread', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createThread(channelId, body, messageId, { reason })
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'create thread', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createForumThread(
  channelId: Snowflake,
  body: Parameters<DiscordChannelsAPI['createForumThread']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'create forum thread', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'create forum thread', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to create a forum thread in a channel that is not in a guild via createForumThread API method.',
     error: new Error(),
    },
   );
  }

  if (![ChannelType.GuildForum, ChannelType.GuildMedia].includes(channel.type)) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'create forum thread', detail: origin, debug: 1, message: reason },
    {
     errorMessage: 'createForumThread can only be used on Forum and Media channels.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canCreateForumThread(channel.guild_id, channelId, body);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'create forum thread', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createForumThread(channelId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'create forum thread', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getArchivedThreads(
  channelId: Snowflake,
  archivedStatus: 'private' | 'public',
  query: RESTGetAPIChannelThreadsArchivedQuery | undefined,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get archived threads', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get archived threads', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to get archived threads in a channel that is not in a guild via getArchivedThreads API method.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canGetArchivedThreads(
   channel.guild_id,
   channelId,
   archivedStatus === 'private',
  );
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'get archived threads', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getArchivedThreads(channelId, archivedStatus, query)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'get archived threads', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getJoinedPrivateArchivedThreads(
  channelId: Snowflake,
  query: RESTGetAPIChannelThreadsArchivedQuery | undefined,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get joined private archived threads', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get joined private archived threads', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to get joined private archived threads in a channel that is not in a guild via getJoinedPrivateArchivedThreads API method.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canGetJoinedPrivateArchivedThreads(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    {
     action: 'get joined private archived threads',
     detail: origin,
     debug: can.debug,
     message: reason,
    },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getJoinedPrivateArchivedThreads(channelId, query)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'get joined private archived threads', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async createWebhook(
  channelId: Snowflake,
  body: RESTPostAPIChannelWebhookJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'create webhook', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'create webhook', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to create a webhook in a channel that is not in a guild via createWebhook API method.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canCreateWebhook(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'create webhook', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .createWebhook(channelId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'create webhook', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async getWebhooks(channelId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get webhooks', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'get webhooks', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to get webhooks for a channel that is not in a guild via getWebhooks API method.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canGetWebhooks(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'get webhooks', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .getWebhooks(channelId)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'get webhooks', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async editPermissionOverwrite(
  channelId: Snowflake,
  overwriteId: Snowflake,
  body: RESTPutAPIChannelPermissionJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'edit permission overwrite', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'edit permission overwrite', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to edit a permission overwrite in a channel that is not in a guild via editPermissionOverwrite API method.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canEditPermissionOverwrite(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'edit permission overwrite', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .editPermissionOverwrite(channelId, overwriteId, body, { reason })
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'edit permission overwrite', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async deletePermissionOverwrite(
  channelId: Snowflake,
  overwriteId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'delete permission overwrite', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'delete permission overwrite', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to delete a permission overwrite in a channel that is not in a guild via deletePermissionOverwrite API method.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canDeletePermissionOverwrite(channel.guild_id, channelId);
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'delete permission overwrite', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .deletePermissionOverwrite(channelId, overwriteId, { reason })
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'delete permission overwrite', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 async sendSoundboardSound(
  channelId: Snowflake,
  body: Parameters<DiscordChannelsAPI['sendSoundboardSound']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  const channel = await this.util.cache.channels.get(channelId);
  if (!channel) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'send soundboard sound', detail: origin, debug: 0, message: reason },
    { errorMessage: 'Channel not found in cache', error: new Error() },
   );
  }

  if (!channel.guild_id) {
   return this.createError(
    { guildId: undefined, channelId },
    { action: 'send soundboard sound', detail: origin, debug: 0, message: reason },
    {
     errorMessage:
      'Attempted to send a soundboard sound in a channel that is not in a guild via sendSoundboardSound API method.',
     error: new Error(),
    },
   );
  }

  const can = await this.util.canSendSoundboardSound(
   channel.guild_id,
   channelId,
   (body as { source_guild_id?: string }).source_guild_id,
  );
  if (!can.response) {
   return this.createError(
    { guildId: channel.guild_id, channelId },
    { action: 'send soundboard sound', detail: origin, debug: can.debug, message: reason },
    { errorMessage: can.message, error: new Error() },
   );
  }

  return this.base
   .sendSoundboardSound(channelId, body)
   .catch((err) =>
    this.createError(
     { guildId: channel.guild_id, channelId },
     { action: 'send soundboard sound', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 createDirectMessage(
  channelId: Snowflake,
  message: Parameters<DiscordChannelsAPI['createMessage']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .createMessage(channelId, message)
   .catch((err) =>
    this.createError(
     { channelId, guildId: undefined },
     { action: 'create direct message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 editDirectMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  message: Parameters<DiscordChannelsAPI['editMessage']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .editMessage(channelId, messageId, message)
   .catch((err) =>
    this.createError(
     { channelId, guildId: undefined },
     { action: 'edit direct message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getDirectMessagePins(
  channelId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getPins(channelId)
   .catch((err) =>
    this.createError(
     { channelId, guildId: undefined },
     { action: 'get direct message pins', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 pinDirectMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .pinMessage(channelId, messageId, { reason })
   .catch((err) =>
    this.createError(
     { channelId, guildId: undefined },
     { action: 'pin direct message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 unpinDirectMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .unpinMessage(channelId, messageId, { reason })
   .catch((err) =>
    this.createError(
     { channelId, guildId: undefined },
     { action: 'unpin direct message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 deleteDirectMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .deleteMessage(channelId, messageId, { reason })
   .catch((err) =>
    this.createError(
     { channelId, guildId: undefined },
     { action: 'delete direct message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 bulkDeleteDirectMessages(
  channelId: Snowflake,
  messageIds: Snowflake[],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .bulkDeleteMessages(channelId, messageIds, { reason })
   .catch((err) =>
    this.createError(
     { channelId, guildId: undefined },
     { action: 'bulk delete direct messages', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getDirectMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getMessage(channelId, messageId)
   .catch((err) =>
    this.createError(
     { channelId, guildId: undefined },
     { action: 'get direct message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
