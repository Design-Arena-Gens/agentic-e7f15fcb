"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import countries from '../data/countries.json';
import { useMapActions } from './MapActionsContext';

type Message = { role: 'you' | 'atlas'; content: string };

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function findCountryByName(name: string) {
  const n = normalize(name);
  return countries.find((c) => normalize(c.name) === n);
}

function findCountryByCapital(cap: string) {
  const n = normalize(cap);
  return countries.find((c) => normalize(c.capital) === n);
}

function listCountriesPrefix(prefix: string) {
  const p = normalize(prefix);
  return countries
    .filter((c) => normalize(c.name).startsWith(p))
    .slice(0, 10)
    .map((c) => c.name);
}

export default function ChatPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'atlas', content: 'Hi! Ask me about a country or capital.' },
    { role: 'atlas', content: 'Examples: "show France", "capital of Japan", "population of Canada"' },
  ]);
  const { actionsRef } = useMapActions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputRef.current?.value ?? '';
    if (!text.trim()) return;
    inputRef.current!.value = '';

    setMessages((m) => [...m, { role: 'you', content: text }]);

    const reply = computeReply(text, actionsRef.current);
    setMessages((m) => [...m, { role: 'atlas', content: reply }]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-white/10 bg-black/20">
        <h2 className="font-semibold">Chat</h2>
      </div>
      <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'you' ? 'text-right' : ''}>
            <div
              className={`inline-block px-3 py-2 rounded-lg text-sm ${
                m.role === 'you' ? 'bg-primary/20 border border-primary/30' : 'bg-white/5 border border-white/10'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about countries?"
            className="flex-1 bg-black/30 border border-white/15 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary text-black font-semibold hover:brightness-110 active:brightness-95"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function computeReply(input: string, actions: ReturnType<typeof useMapActions>['actionsRef']['current']) {
  const text = input.trim();
  const lower = text.toLowerCase();

  // show <country>
  const showMatch = lower.match(/^show\s+(.+)$/);
  if (showMatch) {
    const q = showMatch[1].trim();
    const c = findCountryByName(q) || findCountryByCapital(q);
    if (!c) return `I couldn't find "${q}".`;
    actions?.flyTo(c.lat, c.lng, c.name);
    return `Showing ${c.name}. Capital is ${c.capital}. Population ~ ${c.population.toLocaleString()}.`;
  }

  // capital of <country>
  const capMatch = lower.match(/^capital\s+of\s+(.+)$/);
  if (capMatch) {
    const q = capMatch[1].trim();
    const c = findCountryByName(q);
    if (!c) return `I couldn't find the country "${q}".`;
    actions?.highlightCapitalByName(c.capital);
    return `The capital of ${c.name} is ${c.capital}.`;
  }

  // population of <country>
  const popMatch = lower.match(/^population\s+of\s+(.+)$/);
  if (popMatch) {
    const q = popMatch[1].trim();
    const c = findCountryByName(q);
    if (!c) return `I couldn't find the country "${q}".`;
    actions?.flyTo(c.lat, c.lng, c.name);
    return `${c.name} has a population of ~ ${c.population.toLocaleString()}.`;
  }

  // where is <country or capital>
  const whereMatch = lower.match(/^where\s+is\s+(.+)\??$/);
  if (whereMatch) {
    const q = whereMatch[1].trim();
    const c = findCountryByName(q) || findCountryByCapital(q);
    if (!c) return `I couldn't locate "${q}".`;
    actions?.flyTo(c.lat, c.lng, c.name);
    return `${c.name} (${c.capital}) is here.`;
  }

  // list countries starting with X
  const listMatch = lower.match(/^list\s+countries\s+starting\s+with\s+([a-z])/);
  if (listMatch) {
    const ch = listMatch[1];
    const names = listCountriesPrefix(ch);
    if (!names.length) return `No countries found starting with "${ch.toUpperCase()}".`;
    return `Some countries: ${names.join(', ')}?`;
  }

  return "I can understand: 'show <country>', 'capital of <country>', 'population of <country>', 'where is <name>', 'list countries starting with <letter>'.";
}
