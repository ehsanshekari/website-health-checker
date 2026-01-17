import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import {
  CloudWatchLogsClient,
  StartQueryCommand,
  GetQueryResultsCommand,
  StartQueryCommandInput,
} from '@aws-sdk/client-cloudwatch-logs';

const logger = new Logger();

const LOG_GROUP_NAME = process.env.LOG_GROUP_NAME;
const MAX_LOOKBACK_MINUTES = Number(process.env.MAX_LOOKBACK_MINUTES ?? 60);

interface StatusItem {
  url: string;
  status: string;
  responseTimeMs?: number;
  lastCheck: string; // ISO timestamp
}

const cw = new CloudWatchLogsClient({});

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function handler(): Promise<APIGatewayProxyResultV2> {
  if (!LOG_GROUP_NAME) {
    logger.error('LOG_GROUP_NAME env var is required');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server not configured' }),
    };
  }

  try {
    const end = Math.floor(Date.now() / 1000);
    const start = end - MAX_LOOKBACK_MINUTES * 60;

    // Query raw events: use structured log fields (url is already a field)
    const queryString = [
      'filter ispresent(responseTimeMs) and ispresent(url)',
      'parse message /^(?<statusLabel>[^:]+)/',
      'fields @timestamp, url, statusLabel, responseTimeMs',
      'sort @timestamp desc',
      'limit 100',
    ].join(' | ');

    const params: StartQueryCommandInput = {
      logGroupNames: [LOG_GROUP_NAME],
      startTime: start,
      endTime: end,
      queryString,
    };

    const startRes = await cw.send(new StartQueryCommand(params));
    const queryId = startRes.queryId;
    if (!queryId) {
      throw new Error('Failed to start query');
    }

    // Poll until complete
    let status = 'Running';
    let attempts = 0;
    while (status === 'Running' || status === 'Scheduled') {
      await sleep(500);
      const res = await cw.send(new GetQueryResultsCommand({ queryId }));
      status = res.status ?? 'Unknown';
      if (status === 'Complete') {
        const rows = res.results ?? [];
        // Deduplicate by URL, taking the newest entry first due to sort desc
        const seen = new Set<string>();
        const items: StatusItem[] = [];
        for (const row of rows) {
          const obj: Record<string, string> = {};
          for (const f of row ?? []) {
            if (f.field && f.value != null) obj[f.field] = f.value;
          }
          const url = obj.url;
          if (!url || seen.has(url)) continue;
          seen.add(url);
          const statusLabel = obj.statusLabel ?? '';
          const ts = obj['@timestamp'];
          const responseTimeMs = obj.responseTimeMs
            ? Number(obj.responseTimeMs)
            : undefined;
          items.push({
            url,
            status: normalizeStatus(statusLabel),
            responseTimeMs,
            lastCheck: ts ? new Date(ts).toISOString() : new Date().toISOString(),
          });
        }

        return {
          statusCode: 200,
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ generatedAt: new Date().toISOString(), items }),
        };
      }
      attempts++;
      if (attempts > 40) {
        throw new Error('Query timeout');
      }
    }

    throw new Error(`Query failed with status ${status}`);
  } catch (err) {
    logger.error('Failed to get latest status', { error: String(err) });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch status' }),
    };
  }
}

function normalizeStatus(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('success')) return 'success';
  if (l.includes('content')) return 'content_error';
  if (l.includes('connection')) return 'connection_error';
  return label;
}
