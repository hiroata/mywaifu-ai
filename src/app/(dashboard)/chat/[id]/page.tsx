import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ChatWindow } from '@/components/chat/chat-window';

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }
  return (
    <div className="flex h-full">
      <div className="flex-1">
        <ChatWindow conversationId={params.id} />
      </div>
    </div>
  );
}
