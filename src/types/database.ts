export interface Snippet {
    id: string
    user_id: string
    title: string
    description: string | null
    code: string
    language: string
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    email: string
    created_at: string
}