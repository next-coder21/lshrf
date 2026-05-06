import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

interface AppProviderProps {
    children: ReactNode;
}

import { Toaster } from 'react-hot-toast';

export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <Provider store={store}>
            {children}
            <Toaster position="top-right" />
        </Provider>
    );
};
