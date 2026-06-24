import React, { useState, useEffect } from 'react';
import { useKeyboard } from '@opentui/react';
import { QueueItem } from './QueueItem.js'; // remember to use .js for bun/node module resolution in TUI or just keep .js

interface QueueScreenProps {
    queueData: any[];
    baseUrl: string;
    actionMsg: string;
    onUpdateStatus: (ticketId: string, status: string) => void;
    onCreateRegistration: (patient: string, sex: string | null, type: string, clinic: string) => void;
    onCheckPatientExists: (patientName: string) => Promise<boolean>;
    onRefresh: () => void;
    onShowError: (msg: string) => void;
}

export const QueueScreen: React.FC<QueueScreenProps> = ({
    queueData,
    baseUrl,
    actionMsg,
    onUpdateStatus,
    onCreateRegistration,
    onCheckPatientExists,
    onRefresh,
    onShowError
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const [createStep, setCreateStep] = useState(0);
    const [newPatient, setNewPatient] = useState('');
    const [patientExists, setPatientExists] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [newSexIdx, setNewSexIdx] = useState(0);
    const sexOptions = ["Male", "Female"];
    const [newTypeIdx, setNewTypeIdx] = useState(0);
    const typeOptions = ["Pasien Baru", "Pasien Lama", "Prioritas"];
    const [newClinicIdx, setNewClinicIdx] = useState(0);
    const clinicOptions = ["Poli Anak", "Poli Gigi", "Poli THT", "Poli Umum"];

    // Auto scroll to bottom on first load
    useEffect(() => {
        if (isFirstLoad && queueData.length > 0) {
            setActiveIndex(queueData.length - 1);
            setIsFirstLoad(false);
        }
    }, [queueData, isFirstLoad]);

    useKeyboard((key: any) => {
        if (isChecking) return;

        if (createStep === 1) {
            if (key.name === 'return' || key.name === 'enter') {
                if (newPatient.trim().length > 0) {
                    setIsChecking(true);
                    onCheckPatientExists(newPatient.trim()).then(exists => {
                        setIsChecking(false);
                        setPatientExists(exists);
                        if (exists) setCreateStep(3); // Skip sex
                        else setCreateStep(2); // Ask for sex
                    }).catch(() => {
                        setIsChecking(false);
                        setPatientExists(false);
                        setCreateStep(2);
                    });
                } else setCreateStep(0);
            } else if (key.name === 'escape') {
                setCreateStep(0);
                setNewPatient('');
            } else if (key.name === 'backspace') {
                setNewPatient((prev) => prev.slice(0, -1));
            } else if (key.name === 'space') {
                setNewPatient((prev) => prev + ' ');
            } else if (key.sequence && key.sequence.length === 1) {
                setNewPatient((prev) => prev + key.sequence);
            }
            return;
        }

        if (createStep === 2) {
            if (key.name === 'escape') {
                setCreateStep(0);
            } else if (key.name === 'right' || key.name === 'down') {
                setNewSexIdx(prev => (prev < sexOptions.length - 1 ? prev + 1 : 0));
            } else if (key.name === 'left' || key.name === 'up') {
                setNewSexIdx(prev => (prev > 0 ? prev - 1 : sexOptions.length - 1));
            } else if (key.name === 'return' || key.name === 'enter') {
                setCreateStep(3);
            }
            return;
        }

        if (createStep === 3) {
            if (key.name === 'escape') {
                setCreateStep(0);
            } else if (key.name === 'right' || key.name === 'down') {
                setNewTypeIdx(prev => (prev < typeOptions.length - 1 ? prev + 1 : 0));
            } else if (key.name === 'left' || key.name === 'up') {
                setNewTypeIdx(prev => (prev > 0 ? prev - 1 : typeOptions.length - 1));
            } else if (key.name === 'return' || key.name === 'enter') {
                setCreateStep(4);
            }
            return;
        }

        if (createStep === 4) {
            if (key.name === 'escape') {
                setCreateStep(0);
            } else if (key.name === 'right' || key.name === 'down') {
                setNewClinicIdx(prev => (prev < clinicOptions.length - 1 ? prev + 1 : 0));
            } else if (key.name === 'left' || key.name === 'up') {
                setNewClinicIdx(prev => (prev > 0 ? prev - 1 : clinicOptions.length - 1));
            } else if (key.name === 'return' || key.name === 'enter') {
                const sexVal = patientExists ? null : sexOptions[newSexIdx];
                onCreateRegistration(newPatient.trim(), sexVal, typeOptions[newTypeIdx], clinicOptions[newClinicIdx]);
                setCreateStep(0);
                setNewPatient('');
                setNewTypeIdx(0);
                setNewSexIdx(0);
                setNewClinicIdx(0);
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
                    onUpdateStatus(selectedTicket.name, 'Dipanggil');
                } else if (selectedTicket.status === 'Dipanggil') {
                    onUpdateStatus(selectedTicket.name, 'Selesai');
                } else {
                    onUpdateStatus(selectedTicket.name, 'Dipanggil');
                }
            }
        } else if (key.name === 'n') {
            setCreateStep(1);
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
            borderColor="green"
            paddingX={2}
            paddingY={0}
        >
            {/* Header */}
            <box width="100%" flexDirection="row" justifyContent="space-between" height={1}>
                <text bold={true} color="greenBright" children="ANTREAN PENDAFTARAN" />
                <box flexDirection="row">
                    <text color="cyan" children={`Sesi Aktif | `} />
                    <text color="white" bold={true} children={baseUrl.split('//')[1]?.split('.')[0] || baseUrl} />
                </box>
            </box>
            <box height={1}><text color="green" children={dividerLine} /></box>

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
            <box height={1}><text color="green" children={dividerLine} /></box>

            {createStep === 0 && (
                <box width="100%" flexDirection="row" height={1} justifyContent="space-between">
                    <box flexDirection="row"><text color="greenBright" children="[ENTER]" /><text color="white" children=" Panggil/Selesai" /></box>
                    <box flexDirection="row"><text color="magentaBright" children="[N]" /><text color="white" children=" Pasien Baru" /></box>
                    <box flexDirection="row"><text color="yellowBright" children="[R]" /><text color="white" children=" Refresh" /></box>
                </box>
            )}

            {createStep === 1 && (
                <box width="100%" flexDirection="row" height={1}>
                    <box width={20}><text color="magentaBright" bold={true} children="[1/4] NAMA PASIEN: " /></box>
                    <text color="white" bold={true} children={newPatient + "█"} />
                    {isChecking ? (
                        <box marginLeft={2}><text color="yellow" children="(Memeriksa database...)" /></box>
                    ) : (
                        <box marginLeft={2}><text color="gray" children="(ENTER: Lanjut | ESC: Batal)" /></box>
                    )}
                </box>
            )}

            {createStep === 2 && (
                <box width="100%" flexDirection="row" height={1}>
                    <box width={20}><text color="magentaBright" bold={true} children="[2/4] KELAMIN: " /></box>
                    <box width={30}><text color="white" bold={true} children={`<  ${sexOptions[newSexIdx]}  >`} /></box>
                    <box marginLeft={2}><text color="gray" children="(PANAH: Pilih | ENTER: Lanjut)" /></box>
                </box>
            )}

            {createStep === 3 && (
                <box width="100%" flexDirection="row" height={1}>
                    <box width={20}><text color="magentaBright" bold={true} children="[3/4] TIPE: " /></box>
                    <box width={30}><text color="white" bold={true} children={`<  ${typeOptions[newTypeIdx]}  >`} /></box>
                    <box marginLeft={2}><text color="gray" children="(PANAH: Pilih | ENTER: Lanjut)" /></box>
                </box>
            )}

            {createStep === 4 && (
                <box width="100%" flexDirection="row" height={1}>
                    <box width={20}><text color="magentaBright" bold={true} children="[4/4] POLI: " /></box>
                    <box width={30}><text color="white" bold={true} children={`<  ${clinicOptions[newClinicIdx]}  >`} /></box>
                    <box marginLeft={2}><text color="gray" children="(PANAH: Pilih | ENTER: Simpan)" /></box>
                </box>
            )}

        </box>
    );
};
