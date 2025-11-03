-- 기존 스니펫의 user_id 수정
-- Supabase SQL Editor에서 실행하세요

-- 1. 먼저 현재 로그인한 사용자 ID 확인
SELECT auth.uid() as current_user_id;

-- 2. user_id가 NULL인 스니펫 확인
SELECT id, title, user_id 
FROM snippets 
WHERE user_id IS NULL;

-- 3. user_id가 NULL인 모든 스니펫을 현재 사용자로 설정
-- ⚠️ 주의: 이 쿼리는 신중하게 실행하세요
UPDATE snippets 
SET user_id = auth.uid() 
WHERE user_id IS NULL;

-- 4. 결과 확인
SELECT id, title, user_id 
FROM snippets 
WHERE user_id = auth.uid();

