import React from 'react';
import { Plus } from 'lucide-react';

type Participant = {
  id: number;
  name: string;
  avatar: string;
  color: string;
}

type Board = {
  id: number;
  name: string;
  lastUpdated: string;
  participants: Participant[];
}

const BoardsDashboard = () => {
  // Sample board data
  const boards = [
    {
      id: 1,
      name: "Product Roadmap Q1",
      lastUpdated: "2 hours ago",
      participants: [
        { id: 1, name: "Alice Johnson", avatar: "AJ", color: "bg-blue-500" },
        { id: 2, name: "Bob Smith", avatar: "BS", color: "bg-green-500" },
        { id: 3, name: "Carol Davis", avatar: "CD", color: "bg-purple-500" },
        { id: 4, name: "David Wilson", avatar: "DW", color: "bg-orange-500" },
      ]
    },
    {
      id: 2,
      name: "Marketing Campaign",
      lastUpdated: "1 day ago",
      participants: [
        { id: 5, name: "Eva Brown", avatar: "EB", color: "bg-pink-500" },
        { id: 6, name: "Frank Miller", avatar: "FM", color: "bg-indigo-500" },
        { id: 7, name: "Grace Lee", avatar: "GL", color: "bg-teal-500" },
      ]
    },
    {
      id: 3,
      name: "Design System",
      lastUpdated: "3 days ago",
      participants: [
        { id: 8, name: "Henry Taylor", avatar: "HT", color: "bg-red-500" },
        { id: 9, name: "Iris Chen", avatar: "IC", color: "bg-yellow-500" },
      ]
    },
    {
      id: 4,
      name: "Sprint Planning",
      lastUpdated: "1 week ago",
      participants: [
        { id: 10, name: "Jack Wilson", avatar: "JW", color: "bg-cyan-500" },
        { id: 11, name: "Kelly Moore", avatar: "KM", color: "bg-lime-500" },
        { id: 12, name: "Leo Garcia", avatar: "LG", color: "bg-rose-500" },
        { id: 13, name: "Mia Rodriguez", avatar: "MR", color: "bg-violet-500" },
        { id: 14, name: "Noah Anderson", avatar: "NA", color: "bg-amber-500" },
      ]
    },
    {
      id: 5,
      name: "User Research",
      lastUpdated: "2 weeks ago",
      participants: [
        { id: 15, name: "Olivia Thompson", avatar: "OT", color: "bg-emerald-500" },
        { id: 16, name: "Paul Martinez", avatar: "PM", color: "bg-sky-500" },
      ]
    },
    {
      id: 6,
      name: "Engineering Sync",
      lastUpdated: "3 weeks ago",
      participants: [
        { id: 17, name: "Quinn Davis", avatar: "QD", color: "bg-fuchsia-500" },
        { id: 18, name: "Rachel White", avatar: "RW", color: "bg-slate-500" },
        { id: 19, name: "Sam Johnson", avatar: "SJ", color: "bg-neutral-500" },
      ]
    }
  ];

  const AvatarGroup = ({ participants } : { participants: Participant[] }) => {
    const maxVisible = 4;
    const visibleParticipants = participants.slice(0, maxVisible);
    const remainingCount = Math.max(0, participants.length - maxVisible);

    return (
      <div className="flex -space-x-2">
        {visibleParticipants.map((participant) => (
          <div
            key={participant.id}
            className={`w-8 h-8 rounded-full ${participant.color} flex items-center justify-center text-white text-xs font-medium border-2 border-white shadow-sm`}
            title={participant.name}
          >
            {participant.avatar}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white shadow-sm">
            +{remainingCount}
          </div>
        )}
      </div>
    );
  };

  const BoardCard = ({ board } : { board: Board }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-200">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
            {board.name}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Updated {board.lastUpdated}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <AvatarGroup participants={board.participants} />
          <span className="text-xs text-gray-400">
            {board.participants.length} member{board.participants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );

  const CreateNewCard = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-200 border-dashed">
      <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-gray-400 hover:text-gray-600 transition-colors">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
          <Plus size={24} />
        </div>
        <span className="font-medium text-sm">Create new board</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Boards</h1>
          <p className="text-gray-600">Manage and collaborate on your projects</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CreateNewCard />
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardsDashboard;