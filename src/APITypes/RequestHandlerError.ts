export enum RequestHandlerErrorType {
 Channel = 'channel',
}

interface ChannelPayload {
 guildId: string | undefined;
 channelId: string;
}

type Options<T extends RequestHandlerErrorType> = T extends RequestHandlerErrorType.Channel
 ? ChannelPayload
 : never;

export class RequestHandlerError<T extends RequestHandlerErrorType> {
 options: Options<T>;
 action: string | null = null;
 detail: string | null = null;
 debug: number | null = null;
 reason: string | null = null;
 errorMessage: string | null = null;
 cause: string | null = null;
 error: Error | null = null;

 constructor(options: Options<T>, message: string) {
  this.options = options;
  this.cause = `Guild ID: ${options.guildId}, Channel ID: ${options.channelId}`;
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
