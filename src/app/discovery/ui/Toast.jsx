"use client";
import React from "react";

/* Polite live region; the shell owns the toast state and timeout. */
export default function Toast({ toast }) {
  return (
    <div className="toast-region no-print" role="status" aria-live="polite">
      {toast && <div className={"toast" + (toast.kind === "error" ? " err" : "")}>{toast.msg}</div>}
    </div>
  );
}
