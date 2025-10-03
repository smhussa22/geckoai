"use client";
import { useState } from "react";

interface UserAvatarProps {
    picture?: string | null;
    name?: string | null;
}

export default function UserAvatar({ picture, name }: UserAvatarProps) {
    const [imageError, setImageError] = useState(false);
    const initial = name?.charAt(0).toUpperCase() || "G";

    if (picture && !imageError) {
        return (
            <>
                <img
                    src={picture}
                    onError={() => setImageError(true)}
                    draggable="false"
                    className="h-full w-full object-cover rounded-full"
                />
            </>
        );
    }

    return (
        <div className="bg-asparagus flex h-full w-full items-center justify-center rounded-full">
            <span className="text-night text-xl font-bold">{initial}</span>
        </div>
    );
}
