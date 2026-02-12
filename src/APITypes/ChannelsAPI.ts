import type { Cache, logger as Logger } from '@ayako/utility';
import {
 ChannelType,
 ChannelsAPI as DiscordChannelsAPI,
 GuildFeature,
 type RESTGetAPIChannelMessageReactionUsersQuery,
 type RESTGetAPIChannelMessagesQuery,
 type RESTPatchAPIChannelJSONBody,
 type Snowflake,
} from '@discordjs/core';
import { REST } from '@discordjs/rest';

import type { EmojiResolvable } from '../types/index.js';

import PermissionUtility from './ChannelPermissionsUtility.js';
import { RequestHandlerError } from './RequestHandlerError.js';

export default class ChannelsAPI {
 util: PermissionUtility;
 base: DiscordChannelsAPI;
 rest: REST;
 private appId: string;

 constructor(token: string, logger: typeof Logger, cache: Cache) {
  const rest = new REST({
   api: `http://${process.argv.includes('--dev') ? 'localhost' : 'nirn'}:8080/api`,
  });
  rest.setToken(token);

  this.base = new DiscordChannelsAPI(rest);
  this.rest = rest;
  this.appId = Buffer.from(token.replace('Bot ', '').split('.')[0], 'base64').toString();
  this.util = new PermissionUtility(logger, cache, this.appId);
 }

 private createError(
  options: { guildId: string | undefined; channelId: string },
  {
   action,
   detail,
   debug,
   message,
  }: { action: string; detail: string; debug: number; message: string },
  { errorMessage, error }: { errorMessage: string; error: Error },
 ) {
  return new RequestHandlerError(options, errorMessage)
   .setAction(action)
   .setDetail(detail)
   .setDebug(debug)
   .setReason(message)
   .setDebug(debug)
   .setError(error);
 }

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

  const m = await this.base.createMessage(channelId, message);
  return m;
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

  return this.base.editMessage(channelId, messageId, message);
 }

 // TODO: add editDirectMessage and createDirectMessage

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

  return this.base.getMessageReactions(channelId, messageId, emoji, query);
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

  return this.base.deleteOwnMessageReaction(channelId, messageId, emoji);
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

  return this.base.deleteAllMessageReactions(channelId, messageId);
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

  return this.base.deleteAllMessageReactionsForEmoji(channelId, messageId, emoji);
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

  return this.base.addMessageReaction(channelId, messageId, emoji);
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

  return this.base.edit(channelId, body, { reason });
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

  return this.base.getMessages(channelId, query);
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

  return this.base.showTyping(channelId);
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

  return this.base.getPins(channelId);
 }
}
