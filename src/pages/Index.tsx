
import VoiceChat from '@/components/VoiceChat';

const Index = () => {
  console.log('Index page rendering...');
  
  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <VoiceChat />
      </div>
    );
  } catch (error) {
    console.error('Error in Index page:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-red-500">Check the console for more details</p>
        </div>
      </div>
    );
  }
};

export default Index;
