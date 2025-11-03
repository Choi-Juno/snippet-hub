-- Tags Migration
-- Supabase SQL Editor에서 실행하세요

-- tags 테이블 생성
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- snippet_tags 중간 테이블 (Many-to-Many)
CREATE TABLE IF NOT EXISTS snippet_tags (
  snippet_id UUID REFERENCES snippets(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (snippet_id, tag_id)
);

-- snippets 테이블에 is_favorite 컬럼 추가
ALTER TABLE snippets ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_snippet_tags_snippet_id ON snippet_tags(snippet_id);
CREATE INDEX IF NOT EXISTS idx_snippet_tags_tag_id ON snippet_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_snippets_is_favorite ON snippets(is_favorite);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- RLS 정책
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippet_tags ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 태그를 볼 수 있음
CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  USING (true);

-- 로그인한 사용자는 태그를 생성할 수 있음
CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- snippet_tags는 스니펫 소유자만 관리
CREATE POLICY "Users can view own snippet tags"
  ON snippet_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM snippets
      WHERE snippets.id = snippet_tags.snippet_id
      AND snippets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own snippet tags"
  ON snippet_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM snippets
      WHERE snippets.id = snippet_tags.snippet_id
      AND snippets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own snippet tags"
  ON snippet_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM snippets
      WHERE snippets.id = snippet_tags.snippet_id
      AND snippets.user_id = auth.uid()
    )
  );

