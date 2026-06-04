import { useEffect } from "react";
import { useRouter } from "next/router";
import LoadingIndicator from "@/components/LoadingIndicator";
import Head from "next/head";

/**
 * Chat redirect page
 * 
 * This page handles navigation from notifications that link to /chats/:id
 * and redirects to /messages with the chat opened.
 */
export default function ChatRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id && typeof id === "string") {
      // Redirect to messages page with chat ID as query param
      router.replace(`/messages?chat=${id}`);
    }
  }, [id, router]);

  return (
    <>
      <Head>
        <title>Loading Chat...</title>
      </Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-16 flex items-center justify-center min-h-[60vh]">
        <LoadingIndicator label="Opening chat" />
      </div>
    </>
  );
}
