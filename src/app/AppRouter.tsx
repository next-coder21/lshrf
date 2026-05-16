import { RouterProvider } from 'react-router-dom';
import { router } from '@/router/routes';
import { ErrorBoundary } from '@/common/components/ErrorBoundary';

export const AppRouter = () => {
    return (
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    );
};
