import { Link } from 'react-router-dom';
import { PawPrint, ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-5xl shadow-xl animate-pulse-subtle">
          🐾
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-amber-500">404</h1>
          <h2 className="text-2xl font-black">Page Not Found</h2>
          <p className="text-sm text-slate-400">
            Looks like this paw trail went cold! The page you were looking for doesn't exist or has moved.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm shadow-lg shadow-amber-500/20 transition-all"
        >
          <Home className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
