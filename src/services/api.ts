export const BASE_URL = process.env.BASE_URL

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
        const res = await fetch(`${BASE_URL}/api/resource/Clinic Queue Ticket?fields=["name","patient_name","status","practitioner","encounter_ref"]&limit_page_length=50`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': sessionCookie
            }
        });
        const json = await res.json();
        return json.data || [];
    },

    fetchEncounters: async (sessionCookie: string) => {
        const res = await fetch(`${BASE_URL}/api/resource/Patient Encounter?fields=["name","patient","practitioner"]&limit_page_length=100`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie }
        });
        const json = await res.json();
        return json.data || [];
    },

    updateClinicTicket: async (ticketId: string, payload: any, sessionCookie: string) => {
        const res = await fetch(`${BASE_URL}/api/resource/Clinic Queue Ticket/${ticketId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`Gagal merubah data tiket ${ticketId}.`);
        return true;
    }
};
