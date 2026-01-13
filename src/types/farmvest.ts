export interface FarmvestEmployee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    roles: string[];
    is_active: number;
}

export interface FarmvestPagination {
    current_page: number;
    items_per_page: number;
    total_pages: number;
    total_items: number;
}

export interface FarmvestApiResponse<T> {
    message: string;
    status: number;
    data: T;
    pagination?: FarmvestPagination;
}

export interface FarmvestFarm {
    id: number;
    farm_name: string;
    location: string;
    total_buffaloes_count: number;
}
