import { useEffect } from 'react';

const TestEnv = () => {
  useEffect(() => {
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('All env vars:', import.meta.env);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style>{`
        .instagram-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, #f093fb, #f5576c, #4facfe, #00f2fe);
          background-size: 300% 300%;
          animation: gradientFlow 8s ease infinite;
          opacity: 0.7;
        }
        
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="instagram-bg"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Environment Variables Test</h1>
          <p className="text-gray-600">Check the browser console for environment variable values.</p>
        </div>
      </div>
    </div>
  );
};

export default TestEnv;