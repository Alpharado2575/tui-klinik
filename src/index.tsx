// File: src/apotek.tsx
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import React, { useState, useEffect } from 'react';
import { useKeyboard } from '@opentui/react';

// --- IMPORT KOMPONEN MODULAR ---
import { BASE_URL } from './services/api';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';

const ApotekApp = () => {
  const [username] = useState('Administrator');
  const [password] = useState('1212');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionCookie, setSessionCookie] = useState(''); 
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [queueData, setQueueData] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [actionMsg, setActionMsg] = useState('');
  
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(true); 

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${BASE_URL}/api/method/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usr: username, pwd: password })
      });

      if (!res.ok) throw new Error("Gagal login. Periksa server.");

      const rawCookie = res.headers.get('set-cookie');
      if (rawCookie) {
        const cleanedCookies = rawCookie.split(',').map(c => c.split(';')[0]).join('; ');
        setSessionCookie(cleanedCookies);
      }
      setIsLoggedIn(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!sessionCookie) return;
    try {
      const resApotek = await fetch(`${BASE_URL}/api/resource/Pharmacy Queue Ticket?fields=["*"]&limit_page_length=50`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie }
      });
      const jsonApotek = await resApotek.json();
      
      if (!resApotek.ok) {
        setActionMsg(`Frappe Error: ${jsonApotek.exception || resApotek.statusText}`);
        setQueueData([]);
      } else if (jsonApotek.data) {
        const activeQueue = jsonApotek.data.filter((t: any) => t.status !== "Selesai");
        setQueueData(activeQueue);
      } else {
        setQueueData([]);
      }
    } catch (err: any) {
      setActionMsg(`Network Error: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && sessionCookie) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, sessionCookie]);

  useEffect(() => {
    if (isFirstLoad && queueData.length > 0) {
      setActiveIndex(queueData.length - 1);
      setIsFirstLoad(false);
    }
  }, [queueData, isFirstLoad]);

  const updateStatusOnly = async (ticketId: string, newStatus: string) => {
    try {
      setActionMsg(`Memperbarui: ${ticketId} -> ${newStatus}...`);
      const res = await fetch(`${BASE_URL}/api/resource/Pharmacy Queue Ticket/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setActionMsg(`Sukses! Obat pasien menjadi: ${newStatus}.`);
        
        if (newStatus === "Selesai") {
          setQueueData(prev => {
            const filteredData = prev.filter(t => t.name !== ticketId);
            setActiveIndex(currIdx => currIdx >= filteredData.length ? Math.max(0, filteredData.length - 1) : currIdx);
            return filteredData;
          });
        } else {
          fetchData();
        }

      } else {
        setActionMsg(`Gagal merubah status ${ticketId}.`);
      }
    } catch (err) {
      setActionMsg("Error koneksi saat update status.");
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  useKeyboard((key: any) => {
    if (!isLoggedIn) {
      if (key.name === 'return' || key.name === 'enter') handleLogin();
      return; 
    }

    if (key.name === 'up') {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (key.name === 'down') {
      setActiveIndex((prev) => (prev < (queueData.length > 0 ? queueData.length - 1 : 0) ? prev + 1 : prev));
    } 
    else if (key.name === 'return' || key.name === 'enter') {
      const current = queueData[activeIndex];
      if (current) {
        if (current.status === "Meracik") updateStatusOnly(current.name, "Dipanggil");
        else if (current.status === "Menunggu") updateStatusOnly(current.name, "Dipanggil"); 
        else setActionMsg("Obat sudah siap/diambil. Tekan 'S' jika sudah selesai diserahkan.");
      }
    } else if (key.name === 's') {
      const current = queueData[activeIndex];
      if (current && current.status !== "Selesai") {
        updateStatusOnly(current.name, "Selesai");
      }
    }
    // Blok logika untuk tombol D sudah dihapus sepenuhnya
  });

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        title="LOKET PENYERAHAN OBAT (FARMASI)" 
        username={username} 
        errorMsg={errorMsg} 
        loading={loading} 
      />
    );
  }

  const dividerLine = '─'.repeat(80);
  const MAX_VISIBLE = 5;
  let startIndex = 0;
  if (activeIndex >= MAX_VISIBLE) startIndex = activeIndex - MAX_VISIBLE + 1;
  const visibleQueue = queueData.slice(startIndex, startIndex + MAX_VISIBLE);

  return (
    <box width="100%" height="100%" flexDirection="column" borderStyle="round" borderColor="magenta" paddingX={2} paddingY={0}>
      
      <Header title="ANTREAN LOKET PENYERAHAN OBAT" color="magenta" />

      <box marginTop={1} flexDirection="column" height={15}>
        {isFetching ? (
          <text color="gray" italic={true} children="Mengambil resep dari server..." />
        ) : queueData.length === 0 ? (
          <text color="yellow" italic={true} children="Loket kosong. Belum ada resep obat yang masuk." />
        ) : (
          visibleQueue.map((tiket, index) => {
            const realIndex = startIndex + index;
            const isSelected = realIndex === activeIndex;
            
            const nama = tiket.name || 'N/A';
            const pasien = tiket.patient || tiket.patient_name || tiket.customer || 'Tanpa Nama';
            const status = tiket.status || '-';
            const rujukan = tiket.destination_clinic || tiket.assigned_counter || 'Poliklinik';

            const teksAtas = String(`${nama} - ${pasien}`);
            const teksBawah = String(`Status: ${status}  |  Dari: ${rujukan}`);

            let statusColor = "cyan"; 
            if (status === "Dipanggil") statusColor = "yellow";

            return (
              <box key={nama} flexDirection="row" width="100%" height={2} marginBottom={1}>
                <box width={4} height={2}>
                  <text color={isSelected ? "magenta" : "gray"} bold={isSelected} children={isSelected ? " > " : "   "} />
                </box>
                <box flexDirection="column" width="100%" height={2}>
                  <box width="100%" height={1}>
                    <text color={isSelected ? "magenta" : "white"} bold={true} children={teksAtas} />
                  </box>
                  <box width="100%" height={1}>
                    <text color={statusColor} children={teksBawah} />
                  </box>
                </box>
              </box>
            );
          })
        )}
      </box>

      <box width="100%" height={1}>
        <text color={actionMsg.includes('Gagal') || actionMsg.includes('Error') ? "red" : "green"} bold={true} children={(actionMsg || ' ').padEnd(80, ' ')} />
      </box>

      <box height={1}><text color="gray" children={dividerLine} /></box>
      
      <box width="100%" flexDirection="row" height={1}>
        <box width={40}><text color="cyan" children="[ENTER] Panggil Pasien" /></box>
        <box width={40}><text color="green" children="[S] Selesai (Diserahkan)" /></box>
      </box>

    </box>
  );
};

const renderer = await createCliRenderer();
createRoot(renderer).render(<ApotekApp />);