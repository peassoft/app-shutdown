/**
 * This module provides a class that helps organize an application gracefull shutdown process
 * in a sequence meaningful for that application.
 *
 * @packageDocumentation
 */

export {
  AppShutdown,
  type ShutdownFn,
  type WithShutdown,
  type ShutdownStep,
  type AppShutdownOptions,
} from './app-shutdown.js';
