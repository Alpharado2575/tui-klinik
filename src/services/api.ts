export const BASE_URL = "https://a4a3-103-120-173-31.ngrok-free.app";

export const api = {
    login: async (usr: string, pwd: string) => {
        const res = await fetch(`${BASE_URL}/api/method/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usr, pwd })
        });
        if (!res.ok) throw new Error("Gagal login. Periksa server.");

        const rawCookie = res.headers.get('set-cookie');
        let sessionCookie = '';
        if (rawCookie) {
            sessionCookie = rawCookie.split(',').map(c => c.split(';')[0]).join('; ');
        }
        return sessionCookie;
    },

    fetchQueue: async (sessionCookie: string) => {
        const res = await fetch(`${BASE_URL}/api/resource/Registration Queue Ticket?fields=["name","patient","queue_type","status","destination_clinic"]&limit_page_length=50`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': sessionCookie
            }
        });
        const json = await res.json();
        return json.data || [];
    },

    updateStatus: async (ticketId: string, newStatus: string, sessionCookie: string) => {
        const res = await fetch(`${BASE_URL}/api/resource/Registration Queue Ticket/${ticketId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error(`Gagal merubah status ${ticketId}.`);
        return true;
    },

    createPatient: async (patientName: string, sessionCookie: string) => {
        const nameParts = patientName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        const res = await fetch(`${BASE_URL}/api/resource/Patient`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                sex: "Male",
                status: "Active"
            })
        });
        if (!res.ok) throw new Error("Gagal mendaftarkan pasien ke Master Data.");
        return true;
    },

    createRegistration: async (patientName: string, queueType: string, destination: string, sessionCookie: string) => {
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

        const ticketPayload = {
            queue_type: queueType,
            status: "Menunggu",
            patient: patientName,
            called_at: formattedDate,
            assigned_counter: "Loket Pendaftaran",
            destination_clinic: destination
        };

        let res = await fetch(`${BASE_URL}/api/resource/Registration Queue Ticket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie },
            body: JSON.stringify(ticketPayload)
        });

        if (!res.ok) {
            // Patient might not exist, create patient then retry
            await api.createPatient(patientName, sessionCookie);

            res = await fetch(`${BASE_URL}/api/resource/Registration Queue Ticket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie },
                body: JSON.stringify(ticketPayload)
            });

            if (!res.ok) {
                throw new Error("Gagal membuat antrean meskipun pasien sudah didaftarkan.");
            }
        }
        return true;
    }
};
