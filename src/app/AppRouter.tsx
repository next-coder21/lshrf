import { RouterProvider } from 'react-router-dom';
import { router } from '@/router/routes';

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};
