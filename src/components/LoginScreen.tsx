// File: src/components/LoginScreen.tsx
import React from 'react';

interface LoginScreenProps {
  title: string;
  username: string;
  errorMsg: string;
  loading: boolean;
}

export const LoginScreen = ({ title, username, errorMsg, loading }: LoginScreenProps) => {
  return (
    <box width="100%" height="100%" flexDirection="column" alignItems="center" justifyContent="center" borderStyle="round" borderColor="magenta">
      <text color="magenta" bold={true} children={`KLINIK SATUSEHAT - ${title}`} />
      
      <box marginTop={1} flexDirection="row">
        <text children="Username : " />
        <text color="yellow" children={username} />
      </box>
      
      <box flexDirection="row">
        <text children="Password : " />
        <text color="gray" children="****" />
      </box>
      
      <text 
        marginTop={2} 
        color={errorMsg ? "red" : (loading ? "yellow" : "gray")} 
        children={errorMsg ? `Error: ${errorMsg}` : (loading ? "Menghubungkan ke Server..." : "Tekan [ENTER] untuk Login")} 
      />
    </box>
  );
};