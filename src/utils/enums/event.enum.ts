export enum EVENT_LOCATION_TYPE {
    VIRTUAL = 'virtual',
    PHYSICAL = 'physical',
}

export enum EVENT_VISIBILITY {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

export enum EVENT_THEME {
    MINIMAL = 'minimal',
    MODERN = 'modern',
    CLASSIC = 'classic',
}

export enum TICKET_TYPE {
    FREE = 'free',
    PAID = 'paid',
}

export enum INVITE_STATUS {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    EXPIRED = 'expired',
}

export enum REGISTRATION_STATUS {
    PENDING = 'pending',
    SHORTLISTED = 'shortlisted',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
}

export enum HOST_PERMISSIONS {
    EDIT = 'edit',
    VIEW = 'view',
    INSIGHTS = 'insights',
}

export enum INVITE_ROLE {
    GUEST = 'guest',
    HOST = 'host',
    SPEAKER = 'speaker',
}
