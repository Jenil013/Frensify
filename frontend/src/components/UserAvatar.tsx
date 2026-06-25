import React, { useEffect, useState } from "react";

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

const SIZE_CLASSES = {
  sm: {
    outer: "w-10 h-10",
    inner: "w-7 h-7 text-xs",
  },
  lg: {
    outer: "w-20 h-20",
    inner: "w-full h-full text-lg",
  },
} as const;

interface UserAvatarProps {
  name: string;
  profilePictureUrl?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export default function UserAvatar({
  name,
  profilePictureUrl,
  size = "sm",
  className = "",
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(profilePictureUrl) && !imageFailed;
  const sizes = SIZE_CLASSES[size];

  useEffect(() => {
    setImageFailed(false);
  }, [profilePictureUrl]);

  return (
    <div
      className={`${sizes.outer} bg-white rounded-full border border-[#E9E9E7] flex items-center justify-center shadow-sm shrink-0 overflow-hidden ${className}`}
    >
      {showImage ? (
        <img
          src={profilePictureUrl!}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={`${sizes.inner} bg-[#EAF5F1] rounded-full flex items-center justify-center text-[#2D6A53] font-semibold uppercase`}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
