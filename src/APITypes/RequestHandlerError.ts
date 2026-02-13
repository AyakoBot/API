export enum RequestHandlerErrorType {
 Channel = 'channel',
 ApplicationCommands = 'applicationCommands',
 Applications = 'applications',
 Guilds = 'guilds',
 Webhooks = 'webhooks',
 Interactions = 'interactions',
 Invites = 'invites',
}

interface ChannelPayload {
 guildId: string | undefined;
 channelId: string;
}

interface ApplicationCommandsPayload {
 applicationId: string;
 guildId: string | undefined;
}

interface ApplicationsPayload {
 applicationId: string;
 guildId: string | undefined;
}

interface GuildsPayload {
 guildId: string;
}

interface WebhooksPayload {
 webhookId: string;
}

interface InteractionsPayload {
 interactionId: string;
}

interface InvitesPayload {
 inviteCode: string;
}

export type Options<T extends RequestHandlerErrorType> = T extends RequestHandlerErrorType.Channel
 ? ChannelPayload
 : T extends RequestHandlerErrorType.ApplicationCommands
   ? ApplicationCommandsPayload
   : T extends RequestHandlerErrorType.Applications
     ? ApplicationsPayload
     : T extends RequestHandlerErrorType.Guilds
       ? GuildsPayload
       : T extends RequestHandlerErrorType.Webhooks
         ? WebhooksPayload
         : T extends RequestHandlerErrorType.Interactions
           ? InteractionsPayload
           : T extends RequestHandlerErrorType.Invites
             ? InvitesPayload
             : never;

export class RequestHandlerError<T extends RequestHandlerErrorType> {
 options: Options<T>;

 action: string | null = null;
 detail: string | null = null;

 reason: string | null = null;
 errorMessage: string | null = null;

 cause: string | null = null;
 error: Error | null = null;

 // -1 means the error originated from a failed API request
 // while a number hints at the failed validator index
 debug: -1 | number | null = null;

 constructor(options: Options<T>, message: string) {
  this.options = options;
  this.cause =
   'channelId' in options
    ? `Guild ID: ${options.guildId}, Channel ID: ${options.channelId}`
    : 'applicationId' in options
      ? `Application ID: ${options.applicationId}, Guild ID: ${options.guildId}`
      : 'webhookId' in options
        ? `Webhook ID: ${options.webhookId}`
        : 'interactionId' in options
          ? `Interaction ID: ${options.interactionId}`
          : 'inviteCode' in options
            ? `Invite Code: ${options.inviteCode}`
            : `Guild ID: ${options.guildId}`;
  this.errorMessage = message;
 }

 setAction(action: string) {
  this.action = action;
  return this;
 }

 setDetail(detail: string) {
  this.detail = detail;
  return this;
 }

 setDebug(debug: number) {
  this.debug = debug;
  return this;
 }

 setReason(reason: string) {
  this.reason = reason;
  return this;
 }

 setError(error: Error) {
  this.error = error;
  return this;
 }
}
