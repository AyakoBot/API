export type EmojiResolvable = `a:${string}:${string}` | `${string}|${string}` | string;

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

export type Origin = {
 action: string;
 detail: string;
 debug: number;
 message: string;
};

export type ErrorDetail = {
 errorMessage: string;
 error: Error;
};
