import type { logger as Logger } from '@ayako/utility';
import { MonetizationAPI as DiscordMonetizationAPI, type Snowflake } from '@discordjs/core';

import API from './API.js';

export default class MonetizationAPI extends API {
 base: DiscordMonetizationAPI;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super(token, logger, guildId);

  this.base = new DiscordMonetizationAPI(this.rest);
 }

 // SKUs

 getSKUs({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getSKUs(this.appId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get SKUs', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 // Subscriptions

 getSKUSubscriptions(
  skuId: Snowflake,
  query: Parameters<DiscordMonetizationAPI['getSKUSubscriptions']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getSKUSubscriptions(skuId, query)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get SKU subscriptions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getSKUSubscription(
  skuId: Snowflake,
  subscriptionId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getSKUSubscription(skuId, subscriptionId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get SKU subscription', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 // Entitlements

 getEntitlements(
  query: Parameters<DiscordMonetizationAPI['getEntitlements']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getEntitlements(this.appId, query)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get entitlements', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getEntitlement(
  entitlementId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getEntitlement(this.appId, entitlementId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get entitlement', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 createTestEntitlement(
  body: Parameters<DiscordMonetizationAPI['createTestEntitlement']>[1],
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .createTestEntitlement(this.appId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'create test entitlement', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 deleteTestEntitlement(
  entitlementId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .deleteTestEntitlement(this.appId, entitlementId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'delete test entitlement', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 consumeEntitlement(
  entitlementId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .consumeEntitlement(this.appId, entitlementId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'consume entitlement', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
