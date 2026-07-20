"use client";

import React, { createContext, useContext, useState } from 'react';

interface UnsavedChangesContextType {
	isDirty: boolean;
	setDirty: (dirty: boolean) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
	const [isDirty, setDirty] = useState(false);

	return (
		<UnsavedChangesContext.Provider value={{ isDirty, setDirty }}>
			{children}
		</UnsavedChangesContext.Provider>
	);
}

export function useUnsavedChangesState() {
	const context = useContext(UnsavedChangesContext);
	if (!context) {
		throw new Error('useUnsavedChangesState must be used within UnsavedChangesProvider');
	}
	return context;
}
