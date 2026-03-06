import { redirect } from "next/navigation";
import { acceptInvite } from "@/app/dashboard/share-actions";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  let boardId: string;
  try {
    boardId = await acceptInvite(token);
  } catch (error: any) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Invalid Invite
          </h1>
          <p className="text-zinc-500 mb-4">
            {error?.message || "This invite link is no longer valid."}
          </p>
          <a
            href="/dashboard"
            className="text-blue-600 hover:underline text-sm"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  redirect(`/board/${boardId}`);
}
