import React from 'react';

interface QueueItemProps {
    tiket: any;
    isSelected: boolean;
}

export const QueueItem: React.FC<QueueItemProps> = ({ tiket, isSelected }) => {
    const nama = tiket.name || 'N/A';
    const pasien = tiket.patient || 'Tanpa Nama';
    const tipe = tiket.queue_type || '-';
    const tujuan = tiket.destination_clinic || '-';
    const status = tiket.status || '-';

    const teksAtas = String(`${nama} - ${pasien}`);
    const teksBawah = String(`Tipe: ${tipe}  |  Tujuan: ${tujuan}  |  Status: ${status}`);

    return (
        <box flexDirection="row" width="100%" height={2} marginBottom={1}>
            <box width={4} height={2} alignItems="flex-start" justifyContent="center">
                <text
                    color={isSelected ? "greenBright" : "gray"}
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
                    <text color={isSelected ? "greenBright" : "cyan"} bold={isSelected} children={teksAtas} />
                </box>
                <box width="100%" height={1}>
                    <text
                        color={status === "Selesai" ? "green" : (status === "Dipanggil" ? "yellow" : "gray")}
                        italic={!isSelected}
                        children={teksBawah}
                    />
                </box>
            </box>
        </box>
    );
};
