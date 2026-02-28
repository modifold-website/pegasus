"use client";

export default function Tooltip({ content, children, position = "top" }) {
    if(!content) {
        return children;
    }

    return (
        <span className="mf-tooltip" data-position={position}>
            {children}
            
            <span className="mf-tooltip__bubble" role="tooltip">
                {content}
            </span>
        </span>
    );
}