import type { ParsedM3U8, Channel, PlaylistConfig } from "./types";

// Configuration extractors for EXTM3U line
const CONFIG_EXTRACTORS = {
  urlTvg: (line: string) => line.match(/url-tvg="([^"]+)"/)?.[1],
  tvgShift: (line: string) => {
    const match = line.match(/tvg-shift=(\d+)/);
    return match ? Number.parseInt(match[1], 10) : undefined;
  },
  refresh: (line: string) => line.match(/refresh="([^"]+)"/)?.[1],
  cache: (line: string) => {
    const match = line.match(/cache=(\d+)/);
    return match ? Number.parseInt(match[1], 10) : undefined;
  },
  interlace: (line: string) => {
    const match = line.match(/interlace=(\d+)/);
    return match ? Number.parseInt(match[1], 10) : undefined;
  },
  aspectRatio: (line: string) => line.match(/aspect-ratio=([^\s]+)/)?.[1],
  m3uAutoload: (line: string) => {
    const match = line.match(/m3uautoload=(\d+)/);
    return match ? Number.parseInt(match[1], 10) : undefined;
  },
} as const;

// Channel attribute extractors for EXTINF line
const CHANNEL_EXTRACTORS = {
  tvgId: (line: string) => line.match(/tvg-id="([^"]+)"/)?.[1],
  groupTitle: (line: string) => line.match(/group-title="([^"]+)"/)?.[1],
  tvgLogo: (line: string) => line.match(/tvg-logo="([^"]+)"/)?.[1],
  catchup: (line: string) => line.match(/catchup="([^"]+)"/)?.[1],
  catchupDays: (line: string) => line.match(/catchup-days="([^"]+)"/)?.[1],
  catchupSource: (line: string) => line.match(/catchup-source="([^"]+)"/)?.[1],
  title: (line: string) => line.match(/,(.+)$/)?.[1]?.trim(),
} as const;

// VLC option extractors
const VLC_OPTION_EXTRACTORS = {
  userAgent: (line: string) => line.match(/http-user-agent=(.+)$/)?.[1],
  referrer: (line: string) => line.match(/http-referrer=(.+)$/)?.[1],
} as const;

/**
 * Extracts configuration from an EXTM3U line
 */
function extractConfigFromExtM3U(line: string): PlaylistConfig {
  const config: PlaylistConfig = {};

  for (const [key, extractor] of Object.entries(CONFIG_EXTRACTORS)) {
    const value = extractor(line);
    if (value !== undefined) {
      (config as any)[key] = value;
    }
  }

  return config;
}

/**
 * Extracts channel attributes from an EXTINF line
 */
function extractChannelFromExtInf(line: string): Partial<Omit<Channel, "id">> {
  const channel: Partial<Omit<Channel, "id">> = {};

  for (const [key, extractor] of Object.entries(CHANNEL_EXTRACTORS)) {
    const value = extractor(line);
    if (value !== undefined) {
      (channel as any)[key] = value;
    }
  }

  return channel;
}

/**
 * Extracts VLC options and applies them to the current channel
 */
function extractVlcOptions(line: string, channel: Partial<Omit<Channel, "id">>): void {
  for (const [key, extractor] of Object.entries(VLC_OPTION_EXTRACTORS)) {
    const value = extractor(line);
    if (value !== undefined) {
      (channel as any)[key] = value;
    }
  }
}

/**
 * Checks if a line is a valid stream URL
 */
function isStreamUrl(line: string): boolean {
  return (
    line.startsWith("http://") ||
    line.startsWith("https://") ||
    line.startsWith("rtmp://") ||
    line.startsWith("rtsp://")
  );
}

/**
 * Checks if a channel is complete (has required fields)
 */
function isChannelComplete(channel: Partial<Omit<Channel, "id">>): channel is Omit<Channel, "id"> {
  return !!(channel.title && channel.url);
}

/**
 * Preprocesses M3U8 content by cleaning and filtering lines
 */
function preprocessLines(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        (line.length > 0 && !line.startsWith("#")) ||
        line.startsWith("#EXTM3U") ||
        line.startsWith("#EXTINF:") ||
        line.startsWith("#EXTVLCOPT:")
    );
}

/**
 * Parses M3U8 content and returns structured data
 */
export function parseM3U8Content(content: string): ParsedM3U8 {
  if (!content?.trim()) {
    throw new Error("M3U8 content cannot be empty");
  }

  const lines = preprocessLines(content);
  const result: ParsedM3U8 = {
    configs: [],
    channels: [],
  };

  let currentChannel: Partial<Omit<Channel, "id">> = {};
  let lineIndex = 0;

  try {
    for (const line of lines) {
      lineIndex++;

      if (line.startsWith("#EXTM3U")) {
        const config = extractConfigFromExtM3U(line);
        if (Object.keys(config).length > 0) {
          result.configs.push(config);
        }
        continue;
      }

      if (line.startsWith("#EXTINF:")) {
        // Finalize previous channel if it exists
        if (isChannelComplete(currentChannel)) {
          result.channels.push(currentChannel);
        }

        currentChannel = extractChannelFromExtInf(line);
        continue;
      }

      if (line.startsWith("#EXTVLCOPT:")) {
        extractVlcOptions(line, currentChannel);
        continue;
      }

      // Handle stream URL
      if (isStreamUrl(line)) {
        currentChannel.url = line;

        if (isChannelComplete(currentChannel)) {
          result.channels.push(currentChannel);
          currentChannel = {};
        }
        continue;
      }
    }

    // Handle any remaining complete channel
    if (isChannelComplete(currentChannel)) {
      result.channels.push(currentChannel);
    }
  } catch (error) {
    throw new Error(
      `Failed to parse M3U8 content at line ${lineIndex}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  return result;
}

/**
 * Builds a configuration line for EXTM3U header
 */
function buildConfigLine(config: PlaylistConfig): string {
  let line = "#EXTM3U";

  const configEntries: Array<[keyof PlaylistConfig, string]> = [
    ["urlTvg", config.urlTvg ? ` url-tvg="${config.urlTvg}"` : ""],
    ["tvgShift", config.tvgShift !== undefined ? ` tvg-shift=${config.tvgShift}` : ""],
    ["refresh", config.refresh ? ` refresh="${config.refresh}"` : ""],
    ["cache", config.cache !== undefined ? ` cache=${config.cache}` : ""],
    ["interlace", config.interlace !== undefined ? ` interlace=${config.interlace}` : ""],
    ["aspectRatio", config.aspectRatio ? ` aspect-ratio=${config.aspectRatio}` : ""],
    ["m3uAutoload", config.m3uAutoload !== undefined ? ` m3uautoload=${config.m3uAutoload}` : ""],
  ];

  for (const [_, value] of configEntries) {
    if (value) {
      line += value;
    }
  }

  return line;
}

/**
 * Builds an EXTINF line for a channel
 */
function buildExtinfLine(channel: Channel): string {
  let line = "#EXTINF:-1";

  const channelEntries: Array<[keyof Channel, string]> = [
    ["tvgId", channel.tvgId ? ` tvg-id="${channel.tvgId}"` : ""],
    ["groupTitle", channel.groupTitle ? ` group-title="${channel.groupTitle}"` : ""],
    ["tvgLogo", channel.tvgLogo ? ` tvg-logo="${channel.tvgLogo}"` : ""],
    ["catchup", channel.catchup ? ` catchup="${channel.catchup}"` : ""],
    ["catchupDays", channel.catchupDays ? ` catchup-days="${channel.catchupDays}"` : ""],
    ["catchupSource", channel.catchupSource ? ` catchup-source="${channel.catchupSource}"` : ""],
  ];

  for (const [_, value] of channelEntries) {
    if (value) {
      line += value;
    }
  }

  return `${line},${channel.title}`;
}

/**
 * Builds VLC option lines for a channel
 */
function buildVlcOptionLines(channel: Channel): string[] {
  const lines: string[] = [];

  if (channel.userAgent) {
    lines.push(`#EXTVLCOPT:http-user-agent=${channel.userAgent}`);
  }

  if (channel.referrer) {
    lines.push(`#EXTVLCOPT:http-referrer=${channel.referrer}`);
  }

  return lines;
}

/**
 * Validates channels before generating M3U8 content
 */
function validateChannelsForGeneration(channels: Channel[]): void {
  if (!Array.isArray(channels)) {
    throw new Error("Channels must be an array");
  }

  const invalidChannels = channels.filter(
    (channel) => !channel.title?.trim() || !channel.url?.trim()
  );

  if (invalidChannels.length > 0) {
    throw new Error(
      `Found ${invalidChannels.length} invalid channel(s). All channels must have title and url.`
    );
  }
}

/**
 * Generates M3U8 content from channels and configurations
 */
export function generateM3U8Content(channels: Channel[], configs: PlaylistConfig[] = []): string {
  validateChannelsForGeneration(channels);

  const lines: string[] = [];

  // Generate headers
  if (configs.length > 0) {
    configs.forEach((config) => {
      lines.push(buildConfigLine(config));
    });
  } else {
    lines.push("#EXTM3U");
  }

  // Generate channel entries
  channels.forEach((channel) => {
    lines.push(buildExtinfLine(channel));
    lines.push(...buildVlcOptionLines(channel));
    lines.push(channel.url);
  });

  return `${lines.join("\n")}\n`;
}

/**
 * Utility function to count channels by group
 */
export function getChannelsByGroup(channels: Channel[]): Record<string, Channel[]> {
  return channels.reduce((acc, channel) => {
    const group = channel.groupTitle || "Ungrouped";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);
}

/**
 * Utility function to get unique group titles
 */
export function getUniqueGroups(channels: Channel[]): string[] {
  const groups = new Set(channels.map((channel) => channel.groupTitle || "Ungrouped"));
  return Array.from(groups).sort();
}

/**
 * Utility function to filter channels by group
 */
export function filterChannelsByGroup(channels: Channel[], groupTitle: string): Channel[] {
  const targetGroup = groupTitle === "Ungrouped" ? undefined : groupTitle;
  return channels.filter((channel) => (channel.groupTitle || undefined) === targetGroup);
}

/**
 * Utility function to validate M3U8 content structure
 */
export function validateM3U8Structure(content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content?.trim()) {
    errors.push("Content is empty");
    return { isValid: false, errors };
  }

  const lines = content.split(/\r?\n/).map((line) => line.trim());

  // Check if it starts with #EXTM3U
  if (!lines.some((line) => line.startsWith("#EXTM3U"))) {
    errors.push("Missing #EXTM3U header");
  }

  // Check for channels
  const hasExtinf = lines.some((line) => line.startsWith("#EXTINF:"));
  if (!hasExtinf) {
    errors.push("No channels found (missing #EXTINF lines)");
  }

  // Check for URLs
  const hasUrls = lines.some((line) => isStreamUrl(line));
  if (!hasUrls) {
    errors.push("No stream URLs found");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
