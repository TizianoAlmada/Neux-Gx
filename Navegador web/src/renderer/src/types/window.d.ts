import { NexusGXAPI } from '../../../preload/index';

declare global {
  interface Window {
    nexusGX?: NexusGXAPI;
  }
}

export {};
