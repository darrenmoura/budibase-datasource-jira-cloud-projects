export interface JsonQuery {
    json: object;
}

export interface ReadQuery {
    projectIdOrKey: string;
}

export interface SearchQuery {
    startAt: number;
    maxResults: number;
    query?: string;
    expand?: string;
}

export interface UpdateQuery {
    projectIdOrKey: string;
    json: object;
}

export interface DeleteQuery {
    projectIdOrKey: string;
    deletePermanently?: boolean;
}

export interface ArchiveQuery {
    projectIdOrKey: string;
}