import React, { ReactNode } from "react";

interface ControllerState {
  openSidenav: boolean;
  sidenavCollapsed: boolean;
  sidenavColor: string;
  sidenavType: "dark" | "white" | "transparent";
  transparentNavbar: boolean;
  fixedNavbar: boolean;
  openConfigurator: boolean;
}

type Action =
  | { type: "OPEN_SIDENAV"; value: boolean }
  | { type: "SIDENAV_COLLAPSED"; value: boolean }
  | { type: "SIDENAV_TYPE"; value: ControllerState["sidenavType"] }
  | { type: "SIDENAV_COLOR"; value: string }
  | { type: "TRANSPARENT_NAVBAR"; value: boolean }
  | { type: "FIXED_NAVBAR"; value: boolean }
  | { type: "OPEN_CONFIGURATOR"; value: boolean };

type ContextValue = [ControllerState, React.Dispatch<Action>];

const AdminUI = React.createContext<ContextValue | null>(null);
AdminUI.displayName = "AdminUIContext";

export function reducer(state: ControllerState, action: Action): ControllerState {
  switch (action.type) {
    case "OPEN_SIDENAV":
      return { ...state, openSidenav: action.value };
    case "SIDENAV_COLLAPSED":
      return { ...state, sidenavCollapsed: action.value };
    case "SIDENAV_TYPE":
      return { ...state, sidenavType: action.value };
    case "SIDENAV_COLOR":
      return { ...state, sidenavColor: action.value };
    case "TRANSPARENT_NAVBAR":
      return { ...state, transparentNavbar: action.value };
    case "FIXED_NAVBAR":
      return { ...state, fixedNavbar: action.value };
    case "OPEN_CONFIGURATOR":
      return { ...state, openConfigurator: action.value };
    default:
      throw new Error(`Unhandled action type: ${(action as Action).type}`);
  }
}

const initialState: ControllerState = {
  openSidenav: false,
  sidenavCollapsed: false,
  sidenavColor: "dark",
  sidenavType: "white",
  transparentNavbar: true,
  fixedNavbar: false,
  openConfigurator: false,
};

export function AdminUIProvider({ children }: { children: ReactNode }) {
  const [controller, dispatch] = React.useReducer(reducer, initialState);
  const value = React.useMemo<ContextValue>(() => [controller, dispatch], [controller, dispatch]);

  return <AdminUI.Provider value={value}>{children}</AdminUI.Provider>;
}

export function useAdminUI(): ContextValue {
  const context = React.useContext(AdminUI);
  if (!context) {
    throw new Error("useAdminUI should be used inside the AdminUIProvider.");
  }
  return context;
}

export const setOpenSidenav = (dispatch: React.Dispatch<Action>, value: boolean) =>
  dispatch({ type: "OPEN_SIDENAV", value });
export const setSidenavCollapsed = (dispatch: React.Dispatch<Action>, value: boolean) =>
  dispatch({ type: "SIDENAV_COLLAPSED", value });
export const setSidenavType = (
  dispatch: React.Dispatch<Action>,
  value: ControllerState["sidenavType"]
) => dispatch({ type: "SIDENAV_TYPE", value });
export const setSidenavColor = (dispatch: React.Dispatch<Action>, value: string) =>
  dispatch({ type: "SIDENAV_COLOR", value });
export const setTransparentNavbar = (dispatch: React.Dispatch<Action>, value: boolean) =>
  dispatch({ type: "TRANSPARENT_NAVBAR", value });
export const setFixedNavbar = (dispatch: React.Dispatch<Action>, value: boolean) =>
  dispatch({ type: "FIXED_NAVBAR", value });
export const setOpenConfigurator = (dispatch: React.Dispatch<Action>, value: boolean) =>
  dispatch({ type: "OPEN_CONFIGURATOR", value });
