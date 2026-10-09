/** Swappable check that a declared mime matches the file header. Unknown types fail closed. */
export interface AssetMagicChecker {
  matches(mimeType: string, body: Buffer): boolean;
  extensionFor(mimeType: string): string | null;
}

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff]);

const EXTENSIONS: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function startsWith(body: Buffer, prefix: Buffer): boolean {
  return (
    body.length >= prefix.length &&
    body.subarray(0, prefix.length).equals(prefix)
  );
}

export function magicMatchesDeclaredMime(
  mimeType: string,
  body: Buffer,
): boolean {
  switch (mimeType) {
    case 'image/png':
      return startsWith(body, PNG);
    case 'image/jpeg':
      return startsWith(body, JPEG);
    case 'image/gif': {
      if (body.length < 6) return false;
      const header = body.subarray(0, 6).toString('ascii');
      return header === 'GIF87a' || header === 'GIF89a';
    }
    case 'image/webp':
      return (
        body.length >= 12 &&
        body.subarray(0, 4).toString('ascii') === 'RIFF' &&
        body.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    default:
      return false;
  }
}

export const assetMagic: AssetMagicChecker = {
  matches: magicMatchesDeclaredMime,
  extensionFor(mimeType: string): string | null {
    return EXTENSIONS[mimeType] ?? null;
  },
};
