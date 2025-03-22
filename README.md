## npm-boilderplate

node.js 프로젝트 및 npm 패키지 생성을 위한 템플릿 레포지터리

## 템플릿 구성 사항

- typescript
    - `@` 별칭
- jest 단위테스트 프레임워크
- rollup 번들러
    - CommonJS/ESM 대응
- 미리 작성된 .npmignore

각 사항에 자세한 내용은 아래에 있습니다

## 템플릿 적용 후 수정사항

### package.json 수정

```json
"name": "YOUR_PACKAGE_NAME"
```

`package.json`에서 name을 자기 프로젝트 명으로 변경해야 합니다

### rollup.config.js (선택)

```js
output: [
    {
        file: 'dist/bundle.cjs',
        format: 'cjs',
        sourcemap: false,
    },
    {
        file: 'dist/bundle.mjs',
        format: 'es',
        sourcemap: false,
    },
],
```

번들링한 js파일을 대상으로 디버깅이 필요할 경우 편의성을 위해 `sourcemap`을 true 로 변경

유닛테스트 시에는 ts 파일을 통해 테스트하므로 기본적으로 비활성화 되어있습니다

라이브러리 배포 시 비활성화 하는것을 권장합니다

```js
plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: './tsconfig.json' }),
    terser(),
],
```

`terser()`는 최종 js 코드을 압축하는 플러그인으로 디버깅 시 필요하다면 일시적으로 주석 처리하거나 제거할 수 있습니다

라이브러리 배포 시 다시 활성화 하는것을 권장합니다

## 구성 사항 세부

### @ 별칭

```ts
// 별칭 미사용
import idea from '../../../featrues/idea'

// 별칭 사용
import idea from '@/featrues/idea'
```

임포트 시 `@` 별칭을 통패 프로젝트 기준의 경로로 접근할 수 있습니다

별칭 추가 시 다음을 수정해야 합니다
- `tsconfig.json` : "compilerOptions.paths" 에 별칭 추가
- `rollup.config.js` : `dts()` 내의 옵션에서 `tsconfig.json`에서 한 것과 동일하게 변경
- `jest.config.ts` : "moduleNameMapper" 에 별칭 추가

### jest 단위테스트 프레임워크

```ts
// example.test.ts

describe('testsuite', ()=>{
    test('test 1', ()=>{
        expect(1 + 2).toBe(3);
    });
});
```

테스트 코드를 작성하고 `yarn test` 를 통해 단위 테스트를 수행할 수 있습니다

### CommonJS/ESM 대응

`cjs`, `mjs`로 각각 번들링해 두 모듈 시스템이 모두 호환됩니다

`d.ts` 도 함께 내보내게 됩니다
 
