import React from 'react';

interface QueueItemProps {
    tiket: any;
    isSelected: boolean;
}

export const QueueItem: React.FC<QueueItemProps> = ({ tiket, isSelected }) => {
    const nama = tiket.name || 'N/A';
    const pasien = tiket.patient_name || 'Tanpa Nama';
    const status = tiket.status || '-';
    const prac = tiket.practitioner || '-';
    const enc = tiket.encounter_ref || '-';

    const teksAtas = String(`${nama} - ${pasien}`);
    const teksBawah = String(`Status: ${status}  |  Prac: ${prac}  |  Enc: ${enc}`);

    return (
        <box flexDirection="row" width="100%" height={2} marginBottom={1}>
            <box width={4} height={2} alignItems="flex-start" justifyContent="center">
                <text
                    color={isSelected ? "orangeBright" : "gray"}
                    bold={isSelected}
                    children={isSelected ? " 🢂 " : "   "}
                />
            </box>
            <box
                flexDirection="column"
                width="100%"
                height={2}
                paddingLeft={1}
            >
                <box width="100%" height={1}>
                    <text color={isSelected ? "orangeBright" : "cyan"} bold={isSelected} children={teksAtas} />
                </box>
                <box width="100%" height={1}>
                    <text
                        color={status === "Selesai" ? "orange" : (status === "Dipanggil" || status === "Diperiksa" ? "yellow" : "gray")}
                        italic={!isSelected}
                        children={teksBawah}
                    />
                </box>
            </box>
        </box>
    );
};
