import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type TimeCapsule = {
    id: string;
    title: string;
    recipient: string;
    date: string;
    type: string;
    photoUri?: string;
    description?: string;
};

type TimeCapsuleContextType = {
    timecapsules: TimeCapsule[];
    addTimeCapsule: (capsule: Omit<TimeCapsule, 'id'>) => Promise<void>;
};

const TimeCapsuleContext = createContext<TimeCapsuleContextType | undefined>(undefined);

const STORAGE_KEY = '@timecapsules_data';

export const TimeCapsuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [timecapsules, setTimecapsules] = useState<TimeCapsule[]>([
        {
            id: "1",
            title: "Sweet 16 Birthday",
            recipient: "Ava",
            date: "August 17, 2030",
            type: "Audio",
        },
    ]);

    useEffect(() => {
        loadTimeCapsules();
    }, []);

    const loadTimeCapsules = async () => {
        try {
            const storedData = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedData) {
                setTimecapsules(JSON.parse(storedData));
            }
        } catch (error) {
            console.error("Failed to load timecapsules", error);
        }
    };

    const addTimeCapsule = async (newCapsule: Omit<TimeCapsule, 'id'>) => {
        try {
            const capsuleWithId = { ...newCapsule, id: Date.now().toString() };
            const updatedList = [capsuleWithId, ...timecapsules];
            setTimecapsules(updatedList);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        } catch (error) {
            console.error("Failed to save timecapsule", error);
        }
    };

    return (
        <TimeCapsuleContext.Provider value={{ timecapsules, addTimeCapsule }}>
            {children}
        </TimeCapsuleContext.Provider>
    );
};

export const useTimeCapsules = () => {
    const context = useContext(TimeCapsuleContext);
    if (context === undefined) {
        throw new Error('useTimeCapsules must be used within a TimeCapsuleProvider');
    }
    return context;
};
