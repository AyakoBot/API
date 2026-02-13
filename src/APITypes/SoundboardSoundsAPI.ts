import type { logger as Logger } from '@ayako/utility';
import { SoundboardSoundsAPI as DiscordSoundboardSoundsAPI } from '@discordjs/core';

import API from './API.js';

export default class SoundboardSoundsAPI extends API {
 base: DiscordSoundboardSoundsAPI;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super(token, logger, guildId);

  this.base = new DiscordSoundboardSoundsAPI(this.rest);
 }

 getSoundboardDefaultSounds({ origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getSoundboardDefaultSounds()
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get soundboard default sounds', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
