/**
 * Root page — redirects to /chat
 */

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/chat");
}
