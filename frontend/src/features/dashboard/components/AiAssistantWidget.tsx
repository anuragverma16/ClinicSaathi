'use client';

import React, { useState } from 'react';

export const AiAssistantWidget = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAi = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      setResponse(data.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center space-x-2">
        <span className="p-2 bg-purple-100 text-purple-600 rounded-lg font-bold">✨ AI Assistant</span>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="E.g., Ask AI to draft a checkup reminder for diabetes patients..."
        className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        onClick={askAi}
        disabled={loading}
        className="bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        {loading ? 'Thinking...' : 'Generate with AI'}
      </button>

      {response && (
        <div className="p-4 bg-purple-50 rounded-lg text-xs text-purple-900 border border-purple-100">
          {response}
        </div>
      )}
    </div>
  );
};