export interface Snippet {
    id: string
    user_id: string
    title: string
    description: string | null
    code: string
    language: string
    is_favorite: boolean
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    email: string
    created_at: string
}

export interface Tag {
    id: string
    name: string
    created_at: string
}

export interface SnippetTag {
    snippet_id: string
    tag_id: string
    created_at: string
}

// 스니펫과 태그를 함께 조회할 때 사용
export interface SnippetWithTags extends Snippet {
    tags?: Tag[]
}