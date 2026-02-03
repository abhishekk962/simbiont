"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export default function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div>
        Loading user profile...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h2>Hi {user.nickname}!</h2>
    </div>
  );
}