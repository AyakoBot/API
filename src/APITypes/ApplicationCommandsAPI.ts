import type { logger as Logger } from '@ayako/utility';
import {
 ApplicationCommandsAPI as DiscordApplicationCommandsAPI,
 type RESTGetAPIApplicationCommandsQuery,
 type RESTGetAPIApplicationGuildCommandsQuery,
 type RESTPatchAPIApplicationCommandJSONBody,
 type RESTPatchAPIApplicationGuildCommandJSONBody,
 type RESTPostAPIApplicationCommandsJSONBody,
 type RESTPostAPIApplicationGuildCommandsJSONBody,
 type RESTPutAPIApplicationCommandPermissionsJSONBody,
 type RESTPutAPIApplicationCommandsJSONBody,
 type RESTPutAPIApplicationGuildCommandsJSONBody,
 type Snowflake,
} from '@discordjs/core';

import API from './API.js';

export default class ApplicationCommandsAPI extends API {
 base: DiscordApplicationCommandsAPI;

 constructor(token: string, logger: typeof Logger, guildId: string) {
  super(token, logger, guildId);

  this.base = new DiscordApplicationCommandsAPI(this.rest);
 }

 getGlobalCommands(
  query: RESTGetAPIApplicationCommandsQuery | undefined,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getGlobalCommands(this.appId, query)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get global commands', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 createGlobalCommand(
  body: RESTPostAPIApplicationCommandsJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .createGlobalCommand(this.appId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'create global command', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getGlobalCommand(commandId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .getGlobalCommand(this.appId, commandId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'get global command', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 editGlobalCommand(
  commandId: Snowflake,
  body: RESTPatchAPIApplicationCommandJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .editGlobalCommand(this.appId, commandId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'edit global command', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 deleteGlobalCommand(commandId: Snowflake, { origin, reason }: { origin: string; reason: string }) {
  return this.base
   .deleteGlobalCommand(this.appId, commandId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'delete global command', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 bulkOverwriteGlobalCommands(
  body: RESTPutAPIApplicationCommandsJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .bulkOverwriteGlobalCommands(this.appId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId: undefined },
     { action: 'bulk overwrite global commands', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getGuildCommands(
  guildId: Snowflake,
  query: RESTGetAPIApplicationGuildCommandsQuery | undefined,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getGuildCommands(this.appId, guildId, query)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'get guild commands', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 createGuildCommand(
  guildId: Snowflake,
  body: RESTPostAPIApplicationGuildCommandsJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .createGuildCommand(this.appId, guildId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'create guild command', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getGuildCommand(
  guildId: Snowflake,
  commandId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getGuildCommand(this.appId, guildId, commandId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'get guild command', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 editGuildCommand(
  guildId: Snowflake,
  commandId: Snowflake,
  body: RESTPatchAPIApplicationGuildCommandJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .editGuildCommand(this.appId, guildId, commandId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'edit guild command', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 deleteGuildCommand(
  guildId: Snowflake,
  commandId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .deleteGuildCommand(this.appId, guildId, commandId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'delete guild command', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 bulkOverwriteGuildCommands(
  guildId: Snowflake,
  body: RESTPutAPIApplicationGuildCommandsJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .bulkOverwriteGuildCommands(this.appId, guildId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'bulk overwrite guild commands', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getGuildCommandPermissions(
  guildId: Snowflake,
  commandId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getGuildCommandPermissions(this.appId, guildId, commandId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'get guild command permissions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 getGuildCommandsPermissions(
  guildId: Snowflake,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .getGuildCommandsPermissions(this.appId, guildId)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'get guild commands permissions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }

 editGuildCommandPermissions(
  userToken: string,
  guildId: Snowflake,
  commandId: Snowflake,
  body: RESTPutAPIApplicationCommandPermissionsJSONBody,
  { origin, reason }: { origin: string; reason: string },
 ) {
  return this.base
   .editGuildCommandPermissions(userToken, this.appId, guildId, commandId, body)
   .catch((err) =>
    this.createError(
     { applicationId: this.appId, guildId },
     { action: 'edit guild command permissions', detail: origin, debug: -1, message: reason },
     { errorMessage: err.message, error: err },
    ),
   );
 }
}
