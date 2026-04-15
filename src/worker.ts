import { generateHtml } from './page';
import content from './content.json';

const html = generateHtml(content);

export default {
  async fetch(): Promise<Response> {
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
};
