import { type Cache, type logger as Logger, getChannelPerms } from '@ayako/utility';
import { type ChannelsAPI, PermissionFlagsBits } from '@discordjs/core';

import type { EmojiResolvable } from '../types/index.js';

import API from './API.js';

type Disallowed = { response: false; debug: number; message: string };
type Allowed = { response: true; debug: number };

export default class PermissionUtility {
 logger: typeof Logger;
 cache: Cache;
 botId: string;

 constructor(logger: typeof Logger, cache: Cache, botId: string) {
  this.logger = logger;
  this.cache = cache;
  this.botId = botId;
 }

 async canCreateMessage(
  guildId: string,
  channelId: string,
  payload: Parameters<ChannelsAPI['createMessage']>[1],
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.SendMessages)) {
   return { response: false, debug: 2, message: 'Missing SendMessages permission' };
  }

  if (payload.message_reference && !API.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return {
    response: false,
    debug: 3,
    message: 'Missing ReadMessageHistory permission for message reference',
   };
  }

  if (payload.tts && !API.hasPerm(perms, PermissionFlagsBits.SendTTSMessages)) {
   return { response: false, debug: 4, message: 'Missing SendTTSMessages permission' };
  }

  if (payload.embeds?.length && !API.hasPerm(perms, PermissionFlagsBits.EmbedLinks)) {
   return { response: false, debug: 5, message: 'Missing EmbedLinks permission' };
  }

  if (
   (payload.files?.length || payload.attachments?.length) &&
   !API.hasPerm(perms, PermissionFlagsBits.AttachFiles)
  ) {
   return { response: false, debug: 6, message: 'Missing AttachFiles permission' };
  }

  if (payload.sticker_ids?.length && !API.hasPerm(perms, PermissionFlagsBits.UseExternalStickers)) {
   return { response: false, debug: 7, message: 'Missing UseExternalStickers permission' };
  }

  if (payload.poll && !API.hasPerm(perms, PermissionFlagsBits.SendPolls)) {
   return { response: false, debug: 8, message: 'Missing SendPolls permission' };
  }

  return { response: true, debug: 9 };
 }

 async canEditMessage(
  guildId: string,
  channelId: string,
  authorId: string | undefined,
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (authorId && authorId !== this.botId) {
   return { response: false, debug: 2, message: 'Cannot edit message not sent by the bot' };
  }

  return { response: true, debug: 3 };
 }

 async canGetMessageReactions(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return { response: false, debug: 1, message: 'Missing ReadMessageHistory permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 2, message: 'Missing ViewChannel permission' };
  }

  return { response: true, debug: 3 };
 }

 async canDeleteMessageReaction(
  guildId: string,
  channelId: string,
  messageId: string,
  emoji: EmojiResolvable,
 ): Promise<Disallowed | Allowed> {
  const canView = await this.canGetMessageReactions(guildId, channelId);
  if (!canView.response) {
   return { response: false, debug: canView.debug, message: canView.message };
  }

  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);
  const canManageMessages = API.hasPerm(perms, PermissionFlagsBits.ManageMessages);

  if (!canManageMessages) {
   const reaction = await this.cache.reactions.get(channelId, messageId, emoji);
   if (!reaction) return { response: true, debug: 6 };
   if (reaction.me) return { response: true, debug: 7 };

   return { response: false, debug: 4, message: 'Missing ManageMessages permission' };
  }

  return { response: true, debug: 5 };
 }

 async canDeleteAllMessageReactions(
  guildId: string,
  channelId: string,
 ): Promise<Disallowed | Allowed> {
  return this.canGetMessages(guildId, channelId);
 }

 async canDeleteAllMessageReactionsForEmoji(
  guildId: string,
  channelId: string,
 ): Promise<Disallowed | Allowed> {
  return this.canGetMessages(guildId, channelId);
 }

 async canAddMessageReaction(
  guildId: string,
  channelId: string,
  emoji: EmojiResolvable,
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.AddReactions)) {
   return { response: false, debug: 1, message: 'Missing AddReactions permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return { response: false, debug: 2, message: 'Missing ReadMessageHistory permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 3, message: 'Missing ViewChannel permission' };
  }

  if (!emoji.includes(':')) return { response: true, debug: 4 };

  if (!API.hasPerm(perms, PermissionFlagsBits.UseExternalEmojis)) {
   return { response: false, debug: 5, message: 'Missing UseExternalEmojis permission' };
  }

  return { response: true, debug: 6 };
 }

 async canEdit(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageChannels)) {
   return { response: false, debug: 2, message: 'Missing ManageChannels permission' };
  }

  return { response: true, debug: 3 };
 }

 async canGetMessages(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return { response: false, debug: 2, message: 'Missing ReadMessageHistory permission' };
  }

  return { response: true, debug: 3 };
 }

 async canShowTyping(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  return this.canGetMessages(guildId, channelId);
 }

 async canGetPins(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  return this.canGetMessages(guildId, channelId);
 }

 async canPinMessage(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageMessages)) {
   return { response: false, debug: 2, message: 'Missing ManageMessages permission' };
  }

  return { response: true, debug: 3 };
 }

 async canUnpinMessage(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  return this.canPinMessage(guildId, channelId);
 }

 async canDeleteMessage(
  guildId: string,
  channelId: string,
  authorId: string | undefined,
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (
   authorId &&
   authorId !== this.botId &&
   !API.hasPerm(perms, PermissionFlagsBits.ManageMessages)
  ) {
   return {
    response: false,
    debug: 2,
    message: 'Missing ManageMessages permission to delete messages from other users',
   };
  }

  return { response: true, debug: 3 };
 }

 async canBulkDeleteMessages(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return { response: false, debug: 2, message: 'Missing ReadMessageHistory permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageMessages)) {
   return { response: false, debug: 3, message: 'Missing ManageMessages permission' };
  }

  return { response: true, debug: 4 };
 }

 async canCrosspostMessage(
  guildId: string,
  channelId: string,
  authorId: string | undefined,
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (authorId === this.botId) {
   if (!API.hasPerm(perms, PermissionFlagsBits.SendMessages)) {
    return { response: false, debug: 2, message: 'Missing SendMessages permission' };
   }
  } else {
   if (!API.hasPerm(perms, PermissionFlagsBits.ManageMessages)) {
    return {
     response: false,
     debug: 3,
     message: 'Missing ManageMessages permission to crosspost messages from other users',
    };
   }
  }

  return { response: true, debug: 4 };
 }

 async canFollowAnnouncements(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageWebhooks)) {
   return { response: false, debug: 1, message: 'Missing ManageWebhooks permission' };
  }

  return { response: true, debug: 2 };
 }

 async canCreateInvite(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.CreateInstantInvite)) {
   return { response: false, debug: 1, message: 'Missing CreateInstantInvite permission' };
  }

  return { response: true, debug: 2 };
 }

 async canGetInvites(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageChannels)) {
   return { response: false, debug: 1, message: 'Missing ManageChannels permission' };
  }

  return { response: true, debug: 2 };
 }

 async canCreateThread(
  guildId: string,
  channelId: string,
  isPrivate: boolean,
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (isPrivate) {
   if (!API.hasPerm(perms, PermissionFlagsBits.CreatePrivateThreads)) {
    return { response: false, debug: 2, message: 'Missing CreatePrivateThreads permission' };
   }
  } else {
   if (!API.hasPerm(perms, PermissionFlagsBits.CreatePublicThreads)) {
    return { response: false, debug: 3, message: 'Missing CreatePublicThreads permission' };
   }
  }

  return { response: true, debug: 4 };
 }

 async canCreateForumThread(
  guildId: string,
  channelId: string,
  payload: Parameters<ChannelsAPI['createForumThread']>[1],
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.SendMessages)) {
   return { response: false, debug: 2, message: 'Missing SendMessages permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.CreatePublicThreads)) {
   return { response: false, debug: 3, message: 'Missing CreatePublicThreads permission' };
  }

  if (payload.message?.embeds?.length && !API.hasPerm(perms, PermissionFlagsBits.EmbedLinks)) {
   return { response: false, debug: 4, message: 'Missing EmbedLinks permission' };
  }

  if (
   payload.message?.attachments?.length &&
   !API.hasPerm(perms, PermissionFlagsBits.AttachFiles)
  ) {
   return { response: false, debug: 5, message: 'Missing AttachFiles permission' };
  }

  if (
   payload.message?.sticker_ids?.length &&
   !API.hasPerm(perms, PermissionFlagsBits.UseExternalStickers)
  ) {
   return { response: false, debug: 6, message: 'Missing UseExternalStickers permission' };
  }

  return { response: true, debug: 7 };
 }

 async canGetArchivedThreads(
  guildId: string,
  channelId: string,
  isPrivate: boolean,
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return { response: false, debug: 1, message: 'Missing ReadMessageHistory permission' };
  }

  if (isPrivate && !API.hasPerm(perms, PermissionFlagsBits.ManageThreads)) {
   return {
    response: false,
    debug: 2,
    message: 'Missing ManageThreads permission for private archived threads',
   };
  }

  return { response: true, debug: 3 };
 }

 async canGetJoinedPrivateArchivedThreads(
  guildId: string,
  channelId: string,
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return { response: false, debug: 1, message: 'Missing ReadMessageHistory permission' };
  }

  return { response: true, debug: 2 };
 }

 async canCreateWebhook(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageWebhooks)) {
   return { response: false, debug: 1, message: 'Missing ManageWebhooks permission' };
  }

  return { response: true, debug: 2 };
 }

 async canGetWebhooks(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  return this.canCreateWebhook(guildId, channelId);
 }

 async canEditPermissionOverwrite(
  guildId: string,
  channelId: string,
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.ManageRoles)) {
   return { response: false, debug: 1, message: 'Missing ManageRoles permission' };
  }

  return { response: true, debug: 2 };
 }

 async canDeletePermissionOverwrite(
  guildId: string,
  channelId: string,
 ): Promise<Disallowed | Allowed> {
  return this.canEditPermissionOverwrite(guildId, channelId);
 }

 async canSendSoundboardSound(
  guildId: string,
  channelId: string,
  sourceGuildId: string | undefined,
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!API.hasPerm(perms, PermissionFlagsBits.Connect)) {
   return { response: false, debug: 1, message: 'Missing Connect permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.Speak)) {
   return { response: false, debug: 2, message: 'Missing Speak permission' };
  }

  if (!API.hasPerm(perms, PermissionFlagsBits.UseSoundboard)) {
   return { response: false, debug: 3, message: 'Missing UseSoundboard permission' };
  }

  if (
   sourceGuildId &&
   sourceGuildId !== guildId &&
   !API.hasPerm(perms, PermissionFlagsBits.UseExternalSounds)
  ) {
   return {
    response: false,
    debug: 4,
    message: 'Missing UseExternalSounds permission for sounds from other servers',
   };
  }

  return { response: true, debug: 5 };
 }
}
