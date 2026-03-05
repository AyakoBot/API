import type { Cache, logger as Logger } from '@ayako/utility';
import { GatewayAPI, API as DiscordAPI } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { EventEmitter } from 'events';

import ApplicationCommandsAPI from './APITypes/ApplicationCommandsAPI.js';
import ApplicationsAPI from './APITypes/ApplicationsAPI.js';
import ChannelsAPI from './APITypes/ChannelsAPI.js';
import GuildsAPI from './APITypes/GuildsAPI.js';
import InteractionsAPI from './APITypes/InteractionsAPI.js';
import InvitesAPI from './APITypes/InvitesAPI.js';
import MonetizationAPI from './APITypes/MonetizationAPI.js';
import OAuth2API from './APITypes/OAuth2API.js';
import PollAPI from './APITypes/PollAPI.js';
import RoleConnectionsAPI from './APITypes/RoleConnectionsAPI.js';
import SoundboardSoundsAPI from './APITypes/SoundboardSoundsAPI.js';
import StageInstancesAPI from './APITypes/StageInstancesAPI.js';
import StickersAPI from './APITypes/StickersAPI.js';
import ThreadsAPI from './APITypes/ThreadsAPI.js';
import UsersAPI from './APITypes/UsersAPI.js';
import VoiceAPI from './APITypes/VoiceAPI.js';
import WebhooksAPI from './APITypes/WebhooksAPI.js';

export default class API extends EventEmitter {
 logger: typeof Logger;
 cache: Cache;

 applicationCommands: ApplicationCommandsAPI;
 applications: ApplicationsAPI;
 channels: ChannelsAPI;
 gateway: GatewayAPI;
 guilds: GuildsAPI;
 invites: InvitesAPI;
 monetization: MonetizationAPI;
 oauth2: OAuth2API;
 poll: PollAPI;
 roleConnections: RoleConnectionsAPI;
 soundboardSounds: SoundboardSoundsAPI;
 stageInstances: StageInstancesAPI;
 stickers: StickersAPI;
 threads: ThreadsAPI;
 users: UsersAPI;
 voice: VoiceAPI;
 webhooks: WebhooksAPI;
 interactions: InteractionsAPI;

 api: DiscordAPI;
 rest: REST;
 botId: string;

 constructor(token: string, logger: typeof Logger, cache: Cache, guildId: string) {
  super();
  this.logger = logger;
  this.cache = cache;

  this.rest = new REST({
   api: `http://${process.argv.includes('--local') ? 'localhost' : 'nirn'}:8080/api`,
  }).setToken(token.includes('Bot ') ? token.replace('Bot ', '') : token);
  this.api = new DiscordAPI(this.rest);
  this.botId = new Buffer(token.replace('Bot ', '').split('.')[0], 'base64').toString();

  this.applicationCommands = new ApplicationCommandsAPI(token, this.logger, guildId);
  this.applications = new ApplicationsAPI(token, this.logger, guildId);
  this.channels = new ChannelsAPI(token, this.logger, guildId, this.cache);
  this.gateway = new GatewayAPI(this.rest);
  this.guilds = new GuildsAPI(token, this.logger, guildId, this.cache);
  this.invites = new InvitesAPI(token, this.logger, guildId, this.cache);
  this.monetization = new MonetizationAPI(token, this.logger, guildId);
  this.oauth2 = new OAuth2API(token, this.logger, guildId);
  this.poll = new PollAPI(token, this.logger, guildId, this.cache);
  this.roleConnections = new RoleConnectionsAPI(token, this.logger, guildId);
  this.soundboardSounds = new SoundboardSoundsAPI(token, this.logger, guildId);
  this.stageInstances = new StageInstancesAPI(token, this.logger, guildId, this.cache);
  this.stickers = new StickersAPI(token, this.logger, guildId);
  this.threads = new ThreadsAPI(token, this.logger, guildId, this.cache);
  this.users = new UsersAPI(token, this.logger, guildId, this.cache);
  this.voice = new VoiceAPI(token, this.logger, guildId, this.cache);
  this.webhooks = new WebhooksAPI(token, this.logger, guildId);
  this.interactions = new InteractionsAPI(token, this.logger, guildId);
 }
}
