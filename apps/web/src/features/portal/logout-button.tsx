"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout(): Promise<void> {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
    router.refresh();
  }

  return <button className="btn btn-ghost btn-small" type="button" onClick={() => void logout()}>Դուրս գալ</button>;
}
