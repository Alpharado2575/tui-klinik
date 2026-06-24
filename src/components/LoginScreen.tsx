import React, { useState } from 'react';
import { useKeyboard } from '@opentui/react';

interface LoginScreenProps {
    onLogin: (username: string, password: string) => void;
    loading: boolean;
    errorMsg: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loading, errorMsg }) => {
    const [username, setUsername] = useState('Administrator');
    const [password, setPassword] = useState('1212');

    useKeyboard((key: any) => {
        // Only listen to enter to trigger login if we are in this component
        // In a full TUI, focus management should handle this, but here we just pass it to onLogin
        if (key.name === 'return' || key.name === 'enter') {
            onLogin(username, password);
        }
    });

    return (
        <box
            width="100%"
            height="100%"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
        >
            <box
                width={60}
                height={15}
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                borderStyle="double"
                borderColor="green"
                paddingX={4}
                paddingY={1}
            >
                <text color="green" bold={true} children="KLINIK SATUSEHAT - ANTREAN POLI" />
                <box height={1} marginBottom={2}><text color="green" children="══════════════════════════════════════" /></box>

                <box width="100%" flexDirection="row" justifyContent="center">
                    <box width={15}><text children="Username" /></box>
                    <text children=": " />
                    <box width={20}><text color="yellow" children={username} /></box>
                </box>

                <box width="100%" flexDirection="row" justifyContent="center" marginTop={1}>
                    <box width={15}><text children="Password" /></box>
                    <text children=": " />
                    <box width={20}><text color="gray" children="****" /></box>
                </box>

                <box marginTop={2}>
                    <text
                        bold={true}
                        color={errorMsg ? "red" : (loading ? "yellow" : "cyan")}
                        children={errorMsg ? `Error: ${errorMsg}` : (loading ? "Menghubungkan ke Server..." : "Tekan [ENTER] untuk Login")}
                    />
                </box>
            </box>
        </box>
    );
};
