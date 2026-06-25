import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import React, { useState, useEffect } from 'react';

import { api, BASE_URL } from './services/api.js';
import { LoginScreen } from './components/LoginScreen.js';
import { QueueScreen } from './components/QueueScreen.js';

const PendaftaranApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionCookie, setSessionCookie] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [queueData, setQueueData] = useState<any[]>([]);
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

  const fetchQueue = async () => {
    if (!sessionCookie) return;
    try {
      const data = await api.fetchQueue(sessionCookie);
      setQueueData(data.filter((t: any) => t.status !== 'Selesai'));
    } catch (err) {
      console.error("Gagal fetch data", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn && sessionCookie) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, sessionCookie]);

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      setActionMsg(`Memproses: ${ticketId}...`);
      await api.updateStatus(ticketId, newStatus, sessionCookie);
      setActionMsg(`Sukses! ${ticketId} -> ${newStatus}`);
      
      // Update locally for instant feedback
      setQueueData(prev =>
        newStatus === 'Selesai'
          ? prev.filter(t => t.name !== ticketId)
          : prev.map(t => t.name === ticketId ? { ...t, status: newStatus } : t)
      );

      // Force fetch to catch backend auto-call logic immediately
      fetchQueue();
    } catch (err) {
      setActionMsg("Error koneksi saat update status.");
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleCreateRegistration = async (patientName: string, sex: string | null, queueType: string, destination: string) => {
    try {
      setActionMsg(`Memproses antrean untuk ${patientName}...`);
      await api.createRegistration(patientName, sex, queueType, destination, sessionCookie);
      setActionMsg(`Berhasil! ${patientName} masuk antrean ${destination}.`);
      fetchQueue();
    } catch (err: any) {
      setActionMsg(err.message || "Error saat proses pembuatan antrean.");
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleCheckPatient = async (patientName: string) => {
    return await api.checkPatientExists(patientName, sessionCookie);
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
      baseUrl={BASE_URL}
      actionMsg={actionMsg}
      onUpdateStatus={handleUpdateStatus}
      onCreateRegistration={handleCreateRegistration}
      onCheckPatientExists={handleCheckPatient}
      onRefresh={fetchQueue}
      onShowError={(msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); }}
    />
  );
};

const renderer = await createCliRenderer();
createRoot(renderer).render(<PendaftaranApp />);