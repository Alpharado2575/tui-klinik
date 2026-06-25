import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import React, { useState, useEffect } from 'react';

import { api, BASE_URL } from './services/api.js';
import { LoginScreen } from './components/LoginScreen.js';
import { QueueScreen } from './components/QueueScreen.js';

const PoliApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionCookie, setSessionCookie] = useState(''); 
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [queueData, setQueueData] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [actionMsg, setActionMsg] = useState('');

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const cookie = await api.login(username, password);
      setSessionCookie(cookie);
      setIsLoggedIn(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    if (!sessionCookie) return;
    try {
      const enc = await api.fetchEncounters(sessionCookie);
      setEncounters(enc);
    } catch (err) {
      console.error("Gagal fetch master data", err);
    }
  };

  const fetchQueue = async () => {
    if (!sessionCookie) return;
    try {
      const data = await api.fetchQueue(sessionCookie);
      setQueueData(data.filter((t: any) => t.status !== 'Selesai'));
    } catch (err) {
      console.error("Gagal fetch data", err);
    }
  };

  const fetchAllData = async () => {
    await fetchMasterData();
    await fetchQueue();
  };

  useEffect(() => {
    if (isLoggedIn && sessionCookie) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, sessionCookie]);

  const handleUpdateClinicTicket = async (ticketId: string, payload: any) => {
    try {
      setActionMsg(`Memproses: ${ticketId}...`);
      await api.updateClinicTicket(ticketId, payload, sessionCookie);
      setActionMsg(`Sukses update status ${ticketId} -> ${payload.status}`);
      setQueueData(prev => 
        payload.status === 'Selesai' 
          ? prev.filter(t => t.name !== ticketId) 
          : prev.map(t => t.name === ticketId ? { ...t, ...payload } : t)
      );
      // Force fetch to catch backend auto-call cascade immediately
      fetchAllData();
    } catch (err) {
      setActionMsg("Gagal Update Status.");
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        loading={loading} 
        errorMsg={errorMsg} 
      />
    );
  }

  return (
    <QueueScreen 
      queueData={queueData}
      encounters={encounters}
      baseUrl={BASE_URL}
      actionMsg={actionMsg}
      onUpdateClinicTicket={handleUpdateClinicTicket}
      onRefresh={fetchAllData}
      onShowError={(msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); }}
    />
  );
};

const renderer = await createCliRenderer();
createRoot(renderer).render(<PoliApp />);