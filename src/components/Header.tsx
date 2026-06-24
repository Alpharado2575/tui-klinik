// File: src/components/Header.tsx
import React from 'react';
import { BASE_URL } from '../services/api';

interface HeaderProps {
  title: string;
  color: string;
}

export const Header = ({ title, color }: HeaderProps) => {
  const dividerLine = '─'.repeat(80);
  
  return (
    <box width="100%" flexDirection="column">
      <box width="100%" flexDirection="row" justifyContent="space-between" height={1}>
        <text bold={true} color={color} children={title} />
        <text color="cyan" children={`Sesi Aktif | ${BASE_URL.split('//')[1].split('.')[0]}`} />
      </box>
      <box height={1}>
        <text color="gray" children={dividerLine} />
      </box>
    </box>
  );
};