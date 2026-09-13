'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

type ChatMessage = {
  id: string;
  sender: 'customer' | 'provider';
  content: string;
  at: string;
};

const DEMO_THREAD: ChatMessage[] = [
  {
    id: '1',
    sender: 'customer',
    content: 'Hi — the leak is under the kitchen sink, water is still coming out slowly.',
    at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    sender: 'provider',
    content: 'Thanks. I\'ll bring pipe clamps and a replacement flexi. ETA about 35 minutes.',
    at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

export default function JobChatPage() {
  const params = useParams();
  const jobId = String(params?.id ?? 'job-demo');
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_THREAD);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'customer',
        content,
        at: new Date().toISOString(),
      },
    ]);
    setText('');
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link href={`/jobs/${jobId}`} className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm font-medium text-slate-900">Messages</p>
            <p className="text-xs text-slate-500">Job {jobId}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-4">
        <div className="flex-1 space-y-3 overflow-y-auto pb-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  m.sender === 'customer'
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-800'
                }`}
              >
                <p>{m.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    m.sender === 'customer' ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {new Date(m.at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-slate-200 pt-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" disabled={!text.trim()}>
            Send
          </Button>
        </form>
        <p className="mt-2 text-center text-xs text-slate-400">
          Demo thread. Production uses Firestore messages + participant rules.
        </p>
      </main>
    </div>
  );
}
