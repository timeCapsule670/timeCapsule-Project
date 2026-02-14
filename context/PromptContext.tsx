import React, { createContext, useContext, useState, useCallback } from "react";

interface PromptContextType {
    selectedPrompt: string | null;
    showSheet: boolean;
    openSheetWithPrompt: (prompt: string) => void;
    closeSheet: () => void;
    toggleSheet: () => void;
}

const PromptContext = createContext<PromptContextType>({
    selectedPrompt: null,
    showSheet: false,
    openSheetWithPrompt: () => { },
    closeSheet: () => { },
    toggleSheet: () => { },
});

export function PromptProvider({ children }: { children: React.ReactNode }) {
    const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
    const [showSheet, setShowSheet] = useState(false);

    const openSheetWithPrompt = useCallback((prompt: string) => {
        setSelectedPrompt(prompt);
        setShowSheet(true);
    }, []);

    const closeSheet = useCallback(() => {
        setShowSheet(false);
        setSelectedPrompt(null);
    }, []);

    const toggleSheet = useCallback(() => {
        setShowSheet((prev) => {
            if (prev) setSelectedPrompt(null);
            return !prev;
        });
    }, []);

    return (
        <PromptContext.Provider
            value={{ selectedPrompt, showSheet, openSheetWithPrompt, closeSheet, toggleSheet }}
        >
            {children}
        </PromptContext.Provider>
    );
}

export const usePromptSheet = () => useContext(PromptContext);
