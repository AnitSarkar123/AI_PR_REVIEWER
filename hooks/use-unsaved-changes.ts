"use client";

import { useEffect, useCallback } from "react";

/**
 * Prevents user from accidentally navigating away or closing window with unsaved changes.
 */
export function useUnsavedChanges(hasUnsavedChanges: boolean) {
    const handleBeforeUnload = useCallback(
        (event: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = "";
            }
        },
        [hasUnsavedChanges]
    );

    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [handleBeforeUnload]);
}
