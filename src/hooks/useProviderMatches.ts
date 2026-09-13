'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { getClientDb, isFirebaseConfigured } from '@/lib/firebase';
import type { Match, MatchStatus } from '@/types';

export type InboxMatch = Match & {
  jobDescription?: string;
  serviceName?: string;
  postcode?: string;
  urgency?: string;
};

const OPEN_STATUSES: MatchStatus[] = ['pending', 'notified'];

export function useProviderMatches(providerId: string | null | undefined) {
  const [matches, setMatches] = useState<InboxMatch[]>([]);
  const [loading, setLoading] = useState(Boolean(providerId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured()) {
      setLoading(false);
      setError(null);
      setMatches([]);
      return;
    }

    setLoading(true);
    let unsub: Unsubscribe | undefined;

    try {
      const q = query(
        collection(getClientDb(), 'matches'),
        where('providerId', '==', providerId),
        where('status', 'in', OPEN_STATUSES),
        orderBy('createdAt', 'desc')
      );

      unsub = onSnapshot(
        q,
        (snap) => {
          const rows: InboxMatch[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Match, 'id'>),
          }));
          setMatches(rows);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('useProviderMatches', err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Subscription failed');
      setLoading(false);
    }

    return () => {
      unsub?.();
    };
  }, [providerId]);

  return { matches, loading, error };
}

export function useCustomerJobs(customerId: string | null | undefined) {
  const [jobs, setJobs] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [loading, setLoading] = useState(Boolean(customerId));

  useEffect(() => {
    if (!customerId || !isFirebaseConfigured()) {
      setJobs([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(getClientDb(), 'jobs'),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [customerId]);

  return { jobs, loading };
}
