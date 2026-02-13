import type { logger as Logger } from '@ayako/utility';
import { StickersAPI as DiscordStickersAPI, type Snowflake } from '@discordjs/core';

import API from './API.js';

export default class StickersAPI extends API {
 base: DiscordStickersAPI;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super(token, logger, guildId);

  this.base = new DiscordStickersAPI(this.rest);
 }

 getStickerPack(
  packId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getStickerPack(packId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get sticker pack', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getStickers({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getStickers()
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get stickers', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 get(
  stickerId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .get(stickerId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get sticker', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
