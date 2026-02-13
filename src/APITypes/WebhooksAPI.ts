import type { logger as Logger } from '@ayako/utility';
import { WebhooksAPI as DiscordWebhooksAPI, type Snowflake } from '@discordjs/core';

import API from './API.js';

export default class WebhooksAPI extends API {
 base: DiscordWebhooksAPI;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super(token, logger, guildId);

  this.base = new DiscordWebhooksAPI(this.rest);
 }

 get(
  id: Snowflake,
  webhookToken: Parameters<DiscordWebhooksAPI['get']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .get(id, webhookToken)
   .catch((err) =>
    this.createError(
     { webhookId: id },
     { action: 'get webhook', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 edit(
  id: Snowflake,
  body: Parameters<DiscordWebhooksAPI['edit']>[1],
  webhookToken: Parameters<DiscordWebhooksAPI['edit']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .edit(id, body, { ...webhookToken, reason })
   .catch((err) =>
    this.createError(
     { webhookId: id },
     { action: 'edit webhook', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 delete(
  id: Snowflake,
  webhookToken: Parameters<DiscordWebhooksAPI['delete']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .delete(id, { ...webhookToken, reason })
   .catch((err) =>
    this.createError(
     { webhookId: id },
     { action: 'delete webhook', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 execute(
  id: Snowflake,
  token: string,
  body: Parameters<DiscordWebhooksAPI['execute']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .execute(id, token, body)
   .catch((err) =>
    this.createError(
     { webhookId: id },
     { action: 'execute webhook', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 executeSlack(
  id: Snowflake,
  token: string,
  body: Parameters<DiscordWebhooksAPI['executeSlack']>[2],
  query: Parameters<DiscordWebhooksAPI['executeSlack']>[3],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .executeSlack(id, token, body, query)
   .catch((err) =>
    this.createError(
     { webhookId: id },
     { action: 'execute slack webhook', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 executeGitHub(
  id: Snowflake,
  token: string,
  body: Parameters<DiscordWebhooksAPI['executeGitHub']>[2],
  query: Parameters<DiscordWebhooksAPI['executeGitHub']>[3],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .executeGitHub(id, token, body, query)
   .catch((err) =>
    this.createError(
     { webhookId: id },
     { action: 'execute github webhook', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getMessage(
  id: Snowflake,
  token: string,
  messageId: Snowflake,
  query: Parameters<DiscordWebhooksAPI['getMessage']>[3],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getMessage(id, token, messageId, query)
   .catch((err) =>
    this.createError(
     { webhookId: id },
     { action: 'get webhook message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 editMessage(
  id: Snowflake,
  token: string,
  messageId: Snowflake,
  body: Parameters<DiscordWebhooksAPI['editMessage']>[3],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .editMessage(id, token, messageId, body)
   .catch((err) =>
    this.createError(
     { webhookId: id },
     { action: 'edit webhook message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 deleteMessage(
  id: Snowflake,
  token: string,
  messageId: Snowflake,
  query: Parameters<DiscordWebhooksAPI['deleteMessage']>[3],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .deleteMessage(id, token, messageId, query)
   .catch((err) =>
    this.createError(
     { webhookId: id },
     { action: 'delete webhook message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
