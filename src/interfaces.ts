export enum MessageTypes {
    log,
    action,
    notify,
    store,
    store_create,
    store_read
}

export const DEBUG = true;
export const VERBOSE = false;

// Background specific
export const DEFAULT_LOG_PREFIX = "[BRE: background]";
export const STORAGE_PREFIX = 'breStatus-';

export enum StorageKind {
    is_active = "isActive"
}

export declare interface StorageObject {
    isActive?: boolean;
    exists?: boolean;
}

// Content script specific

export const CS_LOG_PREFIX = "[BRE: c-s via background]";
export const CLASS_INIT = 'bre-initialised';
export const CLASS_INACTIVE = 'bre-inactive';

export const DELIMITERS = {
    HYPHEN: "-",
    DBL_HYPHEN_A: "--",
    DBL_HYPHEN_B: "—",
    SPACE: " "
};