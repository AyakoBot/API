import type { Cache, logger as Logger } from '@ayako/utility';
import {
 ChannelType,
 ChannelsAPI as DiscordChannelsAPI,
 GuildFeature,
 MessageFlags,
 type CreateMessageOptions,
 type EditMessageOptions,
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

 private static countComponents(
  components: { type: number; components?: { type: number; components?: unknown[] }[] }[],
 ): number {
  let count = components.length;
  for (const component of components) {
   if (component.components) {
    count += ChannelsAPI.countComponents(
     component.components as {
      type: number;
      components?: { type: number; components?: unknown[] }[];
     }[],
    );
   }
  }
  return count;
 }

 private static validateV1Components(
  components: {
   type: number;
   label?: string;
   // eslint-disable-next-line @typescript-eslint/naming-convention
   custom_id?: string;
   placeholder?: string;
   options?: { label?: string; description?: string; value?: string }[];
   components?: {
    type: number;
    label?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    custom_id?: string;
    placeholder?: string;
    options?: { label?: string; description?: string; value?: string }[];
   }[];
  }[],
 ): { valid: true } | { valid: false; debug: number; errorMessage: string } {
  if (components.length > 5) {
   return {
    valid: false,
    debug: 22,
    errorMessage: 'Message must have 5 or fewer action rows',
   };
  }

  for (const row of components) {
   if (!row.components) continue;

   const buttons = row.components.filter((c) => c.type === 2);
   const selects = row.components.filter((c) => c.type >= 3 && c.type <= 8);

   if (buttons.length && selects.length) {
    return {
     valid: false,
     debug: 23,
     errorMessage: 'Action row cannot contain both buttons and select menus',
    };
   }

   if (buttons.length > 5) {
    return {
     valid: false,
     debug: 24,
     errorMessage: 'Action row must have 5 or fewer buttons',
    };
   }

   if (selects.length > 1) {
    return {
     valid: false,
     debug: 25,
     errorMessage: 'Action row must have 1 or fewer select menus',
    };
   }

   for (const button of buttons) {
    if (button.label && button.label.length > 80) {
     return {
      valid: false,
      debug: 26,
      errorMessage: 'Button label must be 80 or fewer characters',
     };
    }

    if (button.custom_id && button.custom_id.length > 100) {
     return {
      valid: false,
      debug: 27,
      errorMessage: 'Button custom_id must be 100 or fewer characters',
     };
    }
   }

   for (const select of selects) {
    if (select.custom_id && select.custom_id.length > 100) {
     return {
      valid: false,
      debug: 28,
      errorMessage: 'Select menu custom_id must be 100 or fewer characters',
     };
    }

    if (select.placeholder && select.placeholder.length > 150) {
     return {
      valid: false,
      debug: 29,
      errorMessage: 'Select menu placeholder must be 150 or fewer characters',
     };
    }

    if (select.options) {
     if (select.options.length > 25) {
      return {
       valid: false,
       debug: 30,
       errorMessage: 'Select menu must have 25 or fewer options',
      };
     }

     for (const option of select.options) {
      if (option.label && option.label.length > 100) {
       return {
        valid: false,
        debug: 31,
        errorMessage: 'Select option label must be 100 or fewer characters',
       };
      }

      if (option.description && option.description.length > 100) {
       return {
        valid: false,
        debug: 32,
        errorMessage: 'Select option description must be 100 or fewer characters',
       };
      }

      if (option.value && option.value.length > 100) {
       return {
        valid: false,
        debug: 33,
        errorMessage: 'Select option value must be 100 or fewer characters',
       };
      }
     }
    }
   }
  }

  return { valid: true };
 }

 private static validateMessagePayload(
  message: EditMessageOptions | CreateMessageOptions,
  isCreate: boolean,
 ): { valid: true } | { valid: false; debug: number; errorMessage: string } {
  if (
   isCreate &&
   !message.content?.length &&
   !message.embeds?.length &&
   ('sticker_ids' in message ? !message.sticker_ids?.length : false) &&
   !message.components?.length &&
   !message.files?.length &&
   ('poll' in message ? !message.poll : false)
  ) {
   return {
    valid: false,
    debug: 10,
    errorMessage:
     'Message must have at least one of: content, embeds, sticker_ids, components, files, or poll',
   };
  }

  if (message.content && message.content.length > 2000) {
   return {
    valid: false,
    debug: 11,
    errorMessage: 'Message content must be 2000 or fewer characters',
   };
  }

  if (message.embeds && message.embeds.length > 10) {
   return { valid: false, debug: 12, errorMessage: 'Message must have 10 or fewer embeds' };
  }

  if ('sticker_ids' in message && message.sticker_ids && message.sticker_ids.length > 3) {
   return { valid: false, debug: 13, errorMessage: 'Message must have 3 or fewer sticker IDs' };
  }

  if (message.embeds?.length) {
   let totalChars = 0;

   for (const embed of message.embeds) {
    if (embed.title && embed.title.length > 256) {
     return {
      valid: false,
      debug: 14,
      errorMessage: 'Embed title must be 256 or fewer characters',
     };
    }

    if (embed.description && embed.description.length > 4096) {
     return {
      valid: false,
      debug: 15,
      errorMessage: 'Embed description must be 4096 or fewer characters',
     };
    }

    if (embed.footer?.text && embed.footer.text.length > 2048) {
     return {
      valid: false,
      debug: 16,
      errorMessage: 'Embed footer text must be 2048 or fewer characters',
     };
    }

    if (embed.author?.name && embed.author.name.length > 256) {
     return {
      valid: false,
      debug: 17,
      errorMessage: 'Embed author name must be 256 or fewer characters',
     };
    }

    totalChars +=
     (embed.title?.length ?? 0) +
     (embed.description?.length ?? 0) +
     (embed.footer?.text?.length ?? 0) +
     (embed.author?.name?.length ?? 0);

    if (embed.fields) {
     if (embed.fields.length > 25) {
      return {
       valid: false,
       debug: 18,
       errorMessage: 'Each embed must have 25 or fewer fields',
      };
     }

     for (const field of embed.fields) {
      if (field.name.length > 256) {
       return {
        valid: false,
        debug: 19,
        errorMessage: 'Embed field name must be 256 or fewer characters',
       };
      }

      if (field.value.length > 1024) {
       return {
        valid: false,
        debug: 20,
        errorMessage: 'Embed field value must be 1024 or fewer characters',
       };
      }

      totalChars += field.name.length + field.value.length;
     }
    }
   }

   if (totalChars > 6000) {
    return {
     valid: false,
     debug: 21,
     errorMessage: 'Total characters across all embeds must be 6000 or fewer',
    };
   }
  }

  if (message.components?.length) {
   const isV2 = message.flags && message.flags & MessageFlags.IsComponentsV2;

   if (isV2) {
    const totalCount = ChannelsAPI.countComponents(
     message.components as {
      type: number;
      components?: { type: number; components?: unknown[] }[];
     }[],
    );

    if (totalCount > 40) {
     return {
      valid: false,
      debug: 34,
      errorMessage: 'V2 message must have 40 or fewer total components',
     };
    }
   } else {
    const v1Result = ChannelsAPI.validateV1Components(message.components);
    if (!v1Result.valid) return v1Result;
   }
  }

  return { valid: true };
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

  const validation = ChannelsAPI.validateMessagePayload(message, true);
  if (!validation.valid) {
   return this.createError(
    { guildId, channelId },
    { action: 'create message', detail: origin, debug: validation.debug, message: reason },
    { errorMessage: validation.errorMessage, error: new Error() },
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

  const validation = ChannelsAPI.validateMessagePayload(message, false);
  if (!validation.valid) {
   return this.createError(
    { guildId: msg?.guild_id || channel?.guild_id, channelId },
    { action: 'edit message', detail: origin, debug: validation.debug, message: reason },
    { errorMessage: validation.errorMessage, error: new Error() },
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
   // eslint-disable-next-line @typescript-eslint/naming-convention
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
