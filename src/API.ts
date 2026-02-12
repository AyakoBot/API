import type { Cache, logger as Logger } from '@ayako/utility';
import {
 ApplicationCommandsAPI,
 ApplicationsAPI,
 ChannelsAPI,
 API as DiscordAPI,
 GatewayAPI,
 GuildsAPI,
 InteractionsAPI,
 InvitesAPI,
 MonetizationAPI,
 OAuth2API,
 PollAPI,
 RoleConnectionsAPI,
 SoundboardSoundsAPI,
 StageInstancesAPI,
 StickersAPI,
 ThreadsAPI,
 UsersAPI,
 VoiceAPI,
 WebhooksAPI,
} from '@discordjs/core';
import { REST } from '@discordjs/rest';

export default class API {
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

 constructor(token: string, logger: typeof Logger, cache: Cache) {
  this.logger = logger;
  this.cache = cache;

  this.rest = new REST({
   api: `http://${process.argv.includes('--local') ? 'localhost' : 'nirn'}:8080/api`,
  }).setToken(token);
  this.api = new DiscordAPI(this.rest);
  this.botId = new Buffer(token.split('.')[0], 'base64').toString();

  this.applicationCommands = new ApplicationCommandsAPI(this.rest);
  this.applications = new ApplicationsAPI(this.rest);
  this.channels = new ChannelsAPI(this.rest);
  this.gateway = new GatewayAPI(this.rest);
  this.guilds = new GuildsAPI(this.rest);
  this.invites = new InvitesAPI(this.rest);
  this.monetization = new MonetizationAPI(this.rest);
  this.oauth2 = new OAuth2API(this.rest);
  this.poll = new PollAPI(this.rest);
  this.roleConnections = new RoleConnectionsAPI(this.rest);
  this.soundboardSounds = new SoundboardSoundsAPI(this.rest);
  this.stageInstances = new StageInstancesAPI(this.rest);
  this.stickers = new StickersAPI(this.rest);
  this.threads = new ThreadsAPI(this.rest);
  this.users = new UsersAPI(this.rest);
  this.voice = new VoiceAPI(this.rest);
  this.webhooks = new WebhooksAPI(this.rest);
  this.interactions = new InteractionsAPI(this.rest, this.webhooks);
 }
}
