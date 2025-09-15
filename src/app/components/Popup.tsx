import React, { ReactNode } from "react";

export default function PopUp({
    children,
    className,
    onClose,
    onClick,
}: {
    children: ReactNode;
    className: string;
    onClose?: () => void;
    onClick?: (e: React.MouseEvent) => void;
}) {
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className={`${className} bg-night max-h-[90vh] w-fit overflow-y-auto rounded-lg outline outline-neutral-800`}
                    onClick={onClick}
                >
                    <div className="p-4">{children}</div>
                </div>
            </div>
        </>
    );
}
