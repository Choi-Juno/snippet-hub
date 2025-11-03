-- Supabase 데이터베이스 설정 확인
-- SQL Editor에서 실행하세요

-- 1. snippets 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'snippets'
ORDER BY ordinal_position;

-- 2. id 컬럼에 DEFAULT 설정이 있는지 확인
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'snippets' AND column_name = 'id';

-- 3. RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'snippets';

-- 4. 현재 로그인한 사용자 ID 확인
SELECT auth.uid() as current_user_id;

-- 5. 테스트 INSERT (실제로 실행됨 - 주의!)
INSERT INTO snippets (user_id, title, code, language, is_favorite)
VALUES (auth.uid(), 'Manual Test', 'console.log("test");', 'javascript', false)
RETURNING *;

-- 위 쿼리가 성공하면 id가 반환되어야 합니다!
-- 만약 에러가 발생하면 에러 메시지를 확인하세요.

