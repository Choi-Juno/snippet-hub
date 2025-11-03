# UUID 검증 임시 비활성화 (디버깅용)

## ⚠️ 주의: 프로덕션에서는 사용하지 마세요!

만약 계속 "잘못된 스니펫 ID입니다" 에러가 발생한다면, 
임시로 UUID 검증을 주석 처리할 수 있습니다.

### 파일 수정

**1. `app/(app)/dashboard/snippets/[id]/page.tsx`**
**2. `app/(app)/dashboard/snippets/[id]/edit/page.tsx`**

다음 부분을 주석 처리:

```typescript
// UUID 유효성 검사
// const uuidRegex =
//     /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// if (!uuidRegex.test(params.id)) {
//     console.error("Invalid UUID format:", params.id);
//     alert(`잘못된 스니펫 ID 형식입니다.\nID: ${params.id}`);
//     router.push("/dashboard");
//     return;
// }

console.log("UUID validation SKIPPED (debugging mode)");
```

이렇게 하면 UUID 검증 없이 실제 어떤 에러가 발생하는지 확인할 수 있습니다.

## 다시 활성화하기

디버깅이 끝나면 주석을 제거하고 원래대로 되돌립니다.

