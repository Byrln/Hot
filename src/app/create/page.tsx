import { currentUser } from "@clerk/nextjs/server";
import CreatePost from "@/components/CreatePost";
import Link from "next/link";

export default async function CreatePage() {
    const user = await currentUser();
    return (
        <div className="lg:col-span-6">
        {user ? <CreatePost/> : null}
      </div>
    );
  }
  