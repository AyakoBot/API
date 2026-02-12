import { type Cache, type logger as Logger, getChannelPerms } from '@ayako/utility';
import { type ChannelsAPI, PermissionFlagsBits } from '@discordjs/core';

import type { EmojiResolvable } from '../types/index.js';

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

 hasPerm(permissions: bigint, permission: bigint): boolean {
  return (
   (permissions & permission) === permission ||
   (permission & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator
  );
 }

 async handleError(
  path: {
   guildId: string | undefined;
   channelId: string;
  },
  origin: {
   action: string;
   detail: string;
   debug: number;
   message: string;
  },
  error: {
   errorMessage: string;
   error: Error;
  },
 ) {
  this.logger.warn(
   `[PermissionUtility] Missing permission to ${origin.action} in guild ${path.guildId}, channel ${path.channelId}. Detail: ${origin.detail}. Debug: ${origin.debug}. Message: ${origin.message}. Error: ${error.errorMessage}`,
  );
  this.logger.warn(error.error.message, error.error.cause, error.error.stack);

  return { success: false, path, origin, error };
 }

 async canCreateMessage(
  guildId: string,
  channelId: string,
  payload: Parameters<ChannelsAPI['createMessage']>[1],
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (payload.message_reference && !this.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return {
    response: false,
    debug: 1,
    message: 'Missing ReadMessageHistory permission for message reference',
   };
  }

  return { response: true, debug: 3 };
 }

 async canEditMessage(
  guildId: string,
  channelId: string,
  authorId: string | undefined,
  // payload: Parameters<ChannelsAPI['editMessage']>[2],
 ): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!this.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (authorId && authorId !== this.botId) {
   return { response: false, debug: 2, message: 'Cannot edit message not sent by the bot' };
  }

  return { response: true, debug: 3 };
 }

 async canGetMessageReactions(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!this.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return { response: false, debug: 1, message: 'Missing ReadMessageHistory permission' };
  }

  if (!this.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
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
  const canManageMessages = this.hasPerm(perms, PermissionFlagsBits.ManageMessages);

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

  if (!this.hasPerm(perms, PermissionFlagsBits.AddReactions)) {
   return { response: false, debug: 1, message: 'Missing AddReactions permission' };
  }

  if (!this.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
   return { response: false, debug: 2, message: 'Missing ReadMessageHistory permission' };
  }

  if (!this.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 3, message: 'Missing ViewChannel permission' };
  }

  if (!emoji.includes(':')) return { response: true, debug: 4 };

  if (!this.hasPerm(perms, PermissionFlagsBits.UseExternalEmojis)) {
   return { response: false, debug: 5, message: 'Missing UseExternalEmojis permission' };
  }

  return { response: true, debug: 6 };
 }

 async canEdit(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!this.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (!this.hasPerm(perms, PermissionFlagsBits.ManageChannels)) {
   return { response: false, debug: 2, message: 'Missing ManageChannels permission' };
  }

  return { response: true, debug: 3 };
 }

 async canGetMessages(guildId: string, channelId: string): Promise<Disallowed | Allowed> {
  const { allow: perms } = await getChannelPerms.call(this.cache, guildId, this.botId, channelId);

  if (!this.hasPerm(perms, PermissionFlagsBits.ViewChannel)) {
   return { response: false, debug: 1, message: 'Missing ViewChannel permission' };
  }

  if (!this.hasPerm(perms, PermissionFlagsBits.ReadMessageHistory)) {
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
}
