"use client";
import { createContext, useContext } from "react";

/* useSession() exposes: data, get(path), set(path, value), update(fn), goTo(sectionId, path),
   confidence, setConfidence(path, level), isTipOpen(key), toggleTip(key), noteFocus(path), toast(msg). */
export const SessionContext = createContext(null);
export const useSession = () => useContext(SessionContext);

/* Lets inputs inside a Field point aria-labelledby at the Field's label. */
export const FieldContext = createContext(null);
