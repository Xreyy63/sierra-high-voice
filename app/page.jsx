'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function Page() {
  const initial = { type: 'Academic Support', title: '', details: '', anonymous: true, name: '', grade: '', location: '', urgent: false, fileName: '', fileData: null };
  const [form, setForm] = useState(() => {
    try { const s = localStorage.getItem('studentVoiceDraft'); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  const [status, setStatus] = useState(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('studentVoiceDraft', JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.continuous = false; recog.interimResults = true; recog.lang = 'en-US';
    recog.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      setForm((f) => ({ ...f, details: f.details + (f.details ? '\n' : '') + transcript }));
    };
    recog.onend = () => setListening(false);
    recognitionRef.current = recog;
  }, []);

  function startListening() { if (!recognitionRef.current) return alert('SpeechRecognition not supported'); recognitionRef.current.start(); setListening(true); }
  function stopListening() { recognitionRef.current?.stop(); setListening(false); }

  function handleChange(e) { const { name, value, type, checked } = e.target; setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value })); }
  function handleFile(e) {
    const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((f) => ({ ...f, fileName: file.name, fileData: reader.result })); reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setStatus('sending');
    try {
      const res = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.ok) { setStatus('sent'); setForm(initial); localStorage.removeItem('studentVoiceDraft'); }
      else { setStatus('error'); alert('Save failed: ' + (data.error || 'unknown')); }
    } catch (err) { console.error(err); setStatus('error'); alert('Network error.'); }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Sierra High — Student Voice</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <select name="type" value={form.type} onChange={handleChange} style={{ padding: 8, borderRadius: 6 }}>
            <option>Academic Support</option>
            <option>Behavior / Bullying</option>
            <option>Safety / Security</option>
            <option>Facilities / Maintenance</option>
            <option>Mental Health</option>
            <option>Other</option>
          </select>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Short summary" style={{ padding: 8, borderRadius: 6 }} />
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location (optional)" style={{ padding: 8, borderRadius: 6 }} />
        </div>

        <textarea name="details" value={form.details} onChange={handleChange} rows={6} style={{ padding: 8, borderRadius: 6 }} placeholder="Describe..." />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={listening ? stopListening : startListening} style={{ padding: '8px 12px', borderRadius: 6 }}>{listening ? 'Stop' : 'Record'}</button>
          <input type="file" onChange={handleFile} />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label><input type="checkbox" name="anonymous" checked={form.anonymous} onChange={handleChange} /> Submit anonymously</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" style={{ padding: 8, borderRadius: 6 }} />
          <input name="grade" value={form.grade} onChange={handleChange} placeholder="Grade" style={{ padding: 8, borderRadius: 6 }} />
          <label><input type="checkbox" name="urgent" checked={form.urgent} onChange={handleChange} /> Mark urgent</label>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: '#0ea5e9', color: 'white', padding: '8px 16px', borderRadius: 6 }}>Submit</button>
          <button type="button" onClick={() => { setForm(initial); localStorage.removeItem('studentVoiceDraft'); }} style={{ padding: '8px 16px', borderRadius: 6 }}>Clear</button>
        </div>

        <div style={{ fontSize: 13, color: '#4b5563' }}>Status: {status ?? 'idle'}</div>
      </form>
      <footer style={{ marginTop: 24, fontSize: 12, color: '#6b7280' }}>
        For emergencies, contact school staff or call 911. This tool is for non-emergency concerns.
      </footer>
    </div>
  );
}
