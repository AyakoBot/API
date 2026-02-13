import type { logger as Logger } from '@ayako/utility';
import {
 InteractionsAPI as DiscordInteractionsAPI,
 WebhooksAPI as DiscordWebhooksAPI,
 type Snowflake,
} from '@discordjs/core';

import API from './API.js';

export default class InteractionsAPI extends API {
 base: DiscordInteractionsAPI;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super(token, logger, guildId);

  const webhooks = new DiscordWebhooksAPI(this.rest);
  this.base = new DiscordInteractionsAPI(this.rest, webhooks);
 }

 // Interaction Responses

 reply(
  interactionId: Snowflake,
  interactionToken: string,
  body: Parameters<DiscordInteractionsAPI['reply']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .reply(interactionId, interactionToken, body)
   .catch((err) =>
    this.createError(
     { interactionId },
     { action: 'reply to interaction', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 defer(
  interactionId: Snowflake,
  interactionToken: string,
  body: Parameters<DiscordInteractionsAPI['defer']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .defer(interactionId, interactionToken, body)
   .catch((err) =>
    this.createError(
     { interactionId },
     { action: 'defer interaction', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 deferMessageUpdate(
  interactionId: Snowflake,
  interactionToken: string,
  body: Parameters<DiscordInteractionsAPI['deferMessageUpdate']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .deferMessageUpdate(interactionId, interactionToken, body)
   .catch((err) =>
    this.createError(
     { interactionId },
     { action: 'defer message update', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 updateMessage(
  interactionId: Snowflake,
  interactionToken: string,
  callbackData: Parameters<DiscordInteractionsAPI['updateMessage']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .updateMessage(interactionId, interactionToken, callbackData)
   .catch((err) =>
    this.createError(
     { interactionId },
     { action: 'update message', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 createAutocompleteResponse(
  interactionId: Snowflake,
  interactionToken: string,
  callbackData: Parameters<DiscordInteractionsAPI['createAutocompleteResponse']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .createAutocompleteResponse(interactionId, interactionToken, callbackData)
   .catch((err) =>
    this.createError(
     { interactionId },
     { action: 'create autocomplete response', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 createModal(
  interactionId: Snowflake,
  interactionToken: string,
  callbackData: Parameters<DiscordInteractionsAPI['createModal']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .createModal(interactionId, interactionToken, callbackData)
   .catch((err) =>
    this.createError(
     { interactionId },
     { action: 'create modal', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 launchActivity(
  interactionId: Snowflake,
  interactionToken: string,
  body: Parameters<DiscordInteractionsAPI['launchActivity']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .launchActivity(interactionId, interactionToken, body)
   .catch((err) =>
    this.createError(
     { interactionId },
     { action: 'launch activity', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 // Follow-up Messages (applicationId stripped, uses this.appId)

 followUp(
  interactionToken: string,
  body: Parameters<DiscordInteractionsAPI['followUp']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .followUp(this.appId, interactionToken, body)
   .catch((err) =>
    this.createError(
     { interactionId: interactionToken },
     { action: 'follow up interaction', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 editReply(
  interactionToken: string,
  callbackData: Parameters<DiscordInteractionsAPI['editReply']>[2],
  messageId: Parameters<DiscordInteractionsAPI['editReply']>[3],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .editReply(this.appId, interactionToken, callbackData, messageId)
   .catch((err) =>
    this.createError(
     { interactionId: interactionToken },
     { action: 'edit interaction reply', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getOriginalReply(
  interactionToken: string,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getOriginalReply(this.appId, interactionToken)
   .catch((err) =>
    this.createError(
     { interactionId: interactionToken },
     { action: 'get original interaction reply', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 deleteReply(
  interactionToken: string,
  messageId: Parameters<DiscordInteractionsAPI['deleteReply']>[2],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .deleteReply(this.appId, interactionToken, messageId)
   .catch((err) =>
    this.createError(
     { interactionId: interactionToken },
     { action: 'delete interaction reply', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
