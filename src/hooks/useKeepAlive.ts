import { useEffect, useState } from 'react';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';
const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export type HealthStatus = 'unknown' | 'ok' | 'error';

export interface HealthState {
  status: HealthStatus;
  db: HealthStatus;
  lastChecked: Date | null;
}

async function pingHealth(): Promise<HealthState> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('unhealthy');
  const data = (await res.json()) as { status: string; db: string; timestamp: string };
  return {
    status: data.status === 'ok' ? 'ok' : 'error',
    db: data.db === 'ok' ? 'ok' : 'error',
    lastChecked: new Date(),
  };
}

export function useKeepAlive(): HealthState {
  const [health, setHealth] = useState<HealthState>({
    status: 'unknown',
    db: 'unknown',
    lastChecked: null,
  });

  useEffect(() => {
    // Ping immediately on mount
    pingHealth()
      .then(setHealth)
      .catch(() =>
        setHealth({ status: 'error', db: 'error', lastChecked: new Date() })
      );

    // Then every 10 minutes
    const id = setInterval(() => {
      pingHealth()
        .then(setHealth)
        .catch(() =>
          setHealth({ status: 'error', db: 'error', lastChecked: new Date() })
        );
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return health;
}
