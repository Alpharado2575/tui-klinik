import React, { useState, useEffect } from 'react';
import { useKeyboard } from '@opentui/react';
import { QueueItem } from './QueueItem.js';

interface QueueScreenProps {
    queueData: any[];
    encounters: any[];
    baseUrl: string;
    actionMsg: string;
    onUpdateClinicTicket: (ticketId: string, payload: any) => void;
    onRefresh: () => void;
}

export const QueueScreen: React.FC<QueueScreenProps> = ({
    queueData,
    encounters,
    baseUrl,
    actionMsg,
    onUpdateClinicTicket,
    onRefresh
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const [updateStep, setUpdateStep] = useState(0);
    const [encounterIdx, setEncounterIdx] = useState(0);
    const [targetTicket, setTargetTicket] = useState<string | null>(null);

    // Auto scroll to bottom on first load
    useEffect(() => {
        if (isFirstLoad && queueData.length > 0) {
            setActiveIndex(queueData.length - 1);
            setIsFirstLoad(false);
        }
    }, [queueData, isFirstLoad]);

    useKeyboard((key: any) => {
        if (updateStep === 1) {
            if (key.name === 'return' || key.name === 'enter') {
                if (encounters.length > 0 && targetTicket) {
                    onUpdateClinicTicket(targetTicket, {
                        status: 'Selesai',
                        encounter_ref: encounters[encounterIdx]?.name || '',
                        practitioner: encounters[encounterIdx]?.practitioner || ''
                    });
                }
                setUpdateStep(0);
                setEncounterIdx(0);
                setTargetTicket(null);
            } else if (key.name === 'escape') {
                setUpdateStep(0);
            } else if (key.name === 'right' || key.name === 'down') {
                setEncounterIdx(prev => (prev < encounters.length - 1 ? prev + 1 : 0));
            } else if (key.name === 'left' || key.name === 'up') {
                setEncounterIdx(prev => (prev > 0 ? prev - 1 : encounters.length - 1));
            }
            return;
        }

        // Normal navigation
        if (key.name === 'up') {
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (key.name === 'down') {
            setActiveIndex((prev) => (prev < (queueData.length > 0 ? queueData.length - 1 : 0) ? prev + 1 : prev));
        } else if (key.name === 'return' || key.name === 'enter') {
            const selectedTicket = queueData[activeIndex];
            if (selectedTicket) {
                if (selectedTicket.status === 'Menunggu') {
                    onUpdateClinicTicket(selectedTicket.name, { status: 'Dipanggil' });
                } else if (selectedTicket.status === 'Dipanggil') {
                    onUpdateClinicTicket(selectedTicket.name, { status: 'Diperiksa' });
                } else if (selectedTicket.status === 'Diperiksa') {
                    setTargetTicket(selectedTicket.name);
                    setUpdateStep(1);
                } else {
                    // Do nothing for Selesai or Dilewati
                }
            }
        } else if (key.name === 'r') {
            onRefresh();
        }
    });

    const dividerLine = '─'.repeat(80);
    const MAX_VISIBLE = 5;
    let startIndex = 0;
    if (activeIndex >= MAX_VISIBLE) startIndex = activeIndex - MAX_VISIBLE + 1;
    const visibleQueue = queueData.slice(startIndex, startIndex + MAX_VISIBLE);

    return (
        <box
            width="100%"
            height="100%"
            flexDirection="column"
            borderStyle="round"
            borderColor="orange"
            paddingX={2}
            paddingY={0}
        >
            {/* Header */}
            <box width="100%" flexDirection="row" justifyContent="space-between" height={1}>
                <text bold={true} color="orangeBright" children="ANTREAN POLI KLINIK" />
                <box flexDirection="row">
                    <text color="cyan" children={`Sesi Aktif | `} />
                    <text color="white" bold={true} children={baseUrl.split('//')[1]?.split('.')[0] || baseUrl} />
                </box>
            </box>
            <box height={1}><text color="orange" children={dividerLine} /></box>

            {/* Main List Area */}
            <box marginTop={1} flexDirection="column" height={15}>
                {queueData.length === 0 ? (
                    <box width="100%" height="100%" alignItems="center" justifyContent="center">
                        <text color="gray" italic={true} children="Mengambil data dari server..." />
                    </box>
                ) : (
                    visibleQueue.map((tiket, index) => {
                        const realIndex = startIndex + index;
                        const isSelected = realIndex === activeIndex;
                        return <QueueItem key={tiket.name} tiket={tiket} isSelected={isSelected} />;
                    })
                )}
            </box>

            {/* Message Area */}
            <box width="100%" height={1}>
                <text
                    color={actionMsg.includes('Gagal') || actionMsg.includes('Error') ? "redBright" : "yellowBright"}
                    bold={true}
                    children={(actionMsg || ' ').padEnd(80, ' ')}
                />
            </box>

            {/* Footer / Shortcut Keys */}
            <box height={1}><text color="orange" children={dividerLine} /></box>

            {updateStep === 0 && (
                <box width="100%" flexDirection="row" height={1} justifyContent="space-between">
                    <box flexDirection="row"><text color="orangeBright" children="[ENTER]" /><text color="white" children=" Panggil/Periksa/Selesai" /></box>
                    <box flexDirection="row"><text color="yellowBright" children="[R]" /><text color="white" children=" Refresh" /></box>
                </box>
            )}

            {updateStep === 1 && (
                <box width="100%" flexDirection="row" height={1}>
                    <box width={20}><text color="magentaBright" bold={true} children="[1/1] ENCOUNTER: " /></box>
                    <box width={40}><text color="white" bold={true} children={`<  ${encounters.length > 0 ? encounters[encounterIdx]?.name : 'Data Kosong'}  >`} /></box>
                    <box marginLeft={2}><text color="gray" children="(PANAH: Pilih | ENTER: Simpan | ESC: Batal)" /></box>
                </box>
            )}

        </box>
    );
};
