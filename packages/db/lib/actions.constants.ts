export const ACTIONS = {
    STATUS_UP: "STATUS_UP",
    STATUS_DOWN: "STATUS_DOWN",
    ERROR: "ERROR",
    ERROR_RECOVERED: "ERROR_RECOVERED"
} as const

export const CHANNELS = {
    SLACK: "SLACK",
    EMAIL: "EMAIL",
    DISCORD: "DISCORD"
} as const