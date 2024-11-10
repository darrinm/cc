import { CustomEmbedDefinition } from 'tldraw';

export const embeds: CustomEmbedDefinition = {
  type: 'hatch',
  title: 'Hatch',
  hostnames: ['hatch.one'],
  minWidth: 300,
  minHeight: 300,
  width: 720,
  height: 500,
  doesResize: true,
  toEmbedUrl: (url) => {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('hatch.one')) {
      return;
    }
    return url;
  },
  fromEmbedUrl: (url) => {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('hatch.one')) {
      return;
    }
    return url;
  },
  icon: 'https://hatch.one/favicon.svg',
};
