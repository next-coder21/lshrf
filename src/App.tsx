import { AppProvider } from '@/app/providers/AppProvider';
import { AppRouter } from '@/app/AppRouter';

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
