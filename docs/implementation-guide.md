# 実装ガイド - フォームバリデーションライブラリ

## 1. 開発環境のセットアップ

### 1.1 必要なツール
```bash
# Node.js (v16以上)
node --version

# npm または yarn
npm --version

# TypeScript
npm install -g typescript

# 開発用パッケージのインストール
npm init -y
npm install --save-dev typescript @types/node
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev webpack webpack-cli ts-loader
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 1.2 プロジェクト構成
```json
// package.json
{
  "name": "form-validator",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## 2. 基本実装の開始

### 2.1 型定義から始める
```typescript
// src/types/index.ts
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  rule: string;
  message: string;
  value?: any;
}

export interface ValidatorOptions {
  message?: string;
  [key: string]: any;
}

export type ValidationRule = {
  name: string;
  validator: (value: any, options?: ValidatorOptions) => boolean | Promise<boolean>;
  defaultMessage: string;
};
```

### 2.2 基本的なバリデーター実装
```typescript
// src/validators/required.ts
import { ValidationRule } from '../types';

export const requiredRule: ValidationRule = {
  name: 'required',
  validator: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },
  defaultMessage: 'この項目は必須です'
};
```

### 2.3 バリデーションエンジンの実装
```typescript
// src/core/ValidationEngine.ts
import { ValidationResult, ValidationError, ValidationRule } from '../types';

export class ValidationEngine {
  private rules: Map<string, ValidationRule> = new Map();

  registerRule(rule: ValidationRule): void {
    this.rules.set(rule.name, rule);
  }

  async validate(value: any, ruleNames: string[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const ruleName of ruleNames) {
      const rule = this.rules.get(ruleName);
      if (!rule) continue;

      const isValid = await rule.validator(value);
      if (!isValid) {
        errors.push({
          rule: ruleName,
          message: rule.defaultMessage,
          value
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## 3. 実装のベストプラクティス

### 3.1 エラーハンドリング
```typescript
// 適切なエラーハンドリングの例
export class ValidationEngine {
  async validate(value: any, ruleNames: string[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const ruleName of ruleNames) {
      try {
        const rule = this.rules.get(ruleName);
        if (!rule) {
          console.warn(`Validation rule '${ruleName}' not found`);
          continue;
        }

        const isValid = await rule.validator(value);
        if (!isValid) {
          errors.push({
            rule: ruleName,
            message: rule.defaultMessage,
            value
          });
        }
      } catch (error) {
        console.error(`Error in validation rule '${ruleName}':`, error);
        errors.push({
          rule: ruleName,
          message: 'バリデーションエラーが発生しました',
          value
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### 3.2 パフォーマンスの考慮
```typescript
// デバウンス処理の実装例
export class Debouncer {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  debounce(key: string, fn: Function, delay: number): void {
    const existing = this.timeouts.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(() => {
      fn();
      this.timeouts.delete(key);
    }, delay);

    this.timeouts.set(key, timeout);
  }

  cancel(key: string): void {
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
    }
  }
}
```

### 3.3 テスト可能な設計
```typescript
// 依存性注入を使用した例
export interface IValidator {
  validate(value: any): Promise<ValidationResult>;
}

export interface IDOMHelper {
  querySelector(selector: string): HTMLElement | null;
  addEventListener(element: HTMLElement, event: string, handler: Function): void;
}

export class FormValidator {
  constructor(
    private validator: IValidator,
    private domHelper: IDOMHelper
  ) {}

  // テストしやすい実装
  async validateField(fieldId: string): Promise<ValidationResult> {
    const field = this.domHelper.querySelector(`#${fieldId}`);
    if (!field) {
      throw new Error(`Field with id '${fieldId}' not found`);
    }

    const value = (field as HTMLInputElement).value;
    return this.validator.validate(value);
  }
}
```

## 4. 段階的な実装アプローチ

### 4.1 第1段階: 最小限の実装
1. 必須バリデーションのみ実装
2. 単一フィールドのバリデーション
3. シンプルなエラー表示

### 4.2 第2段階: 基本機能の拡充
1. 複数のバリデーションルール追加
2. フォーム全体のバリデーション
3. カスタムエラーメッセージ

### 4.3 第3段階: 高度な機能
1. 非同期バリデーション
2. 条件付きバリデーション
3. リアルタイムバリデーション

### 4.4 第4段階: 最適化と改善
1. パフォーマンス最適化
2. アクセシビリティ対応
3. 国際化対応

## 5. コード品質の維持

### 5.1 リンター設定
```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

### 5.2 テスト戦略
```typescript
// tests/validators/required.test.ts
import { requiredRule } from '../../src/validators/required';

describe('Required Validator', () => {
  test('should return false for empty string', () => {
    expect(requiredRule.validator('')).toBe(false);
  });

  test('should return false for null', () => {
    expect(requiredRule.validator(null)).toBe(false);
  });

  test('should return true for non-empty string', () => {
    expect(requiredRule.validator('test')).toBe(true);
  });
});
```

## 6. 実装のチェックリスト

### 基本機能
- [ ] 必須バリデーション
- [ ] メールバリデーション
- [ ] 電話番号バリデーション
- [ ] 数値バリデーション
- [ ] 文字数制限バリデーション

### エラー処理
- [ ] エラーメッセージ表示
- [ ] エラーのクリア
- [ ] カスタムエラーメッセージ
- [ ] 複数エラーの表示

### イベント処理
- [ ] blur イベント
- [ ] change イベント
- [ ] input イベント（オプション）
- [ ] submit イベント

### UI/UX
- [ ] エラー状態のスタイリング
- [ ] ローディング状態
- [ ] 成功状態の表示
- [ ] アクセシビリティ対応

### パフォーマンス
- [ ] デバウンス処理
- [ ] メモリリークの防止
- [ ] 大量フィールドの処理
- [ ] 非同期処理の最適化

### テスト
- [ ] 単体テスト
- [ ] 統合テスト
- [ ] ブラウザテスト
- [ ] パフォーマンステスト

## 7. トラブルシューティング

### よくある問題と解決策

1. **イベントリスナーが動作しない**
   - 要素が存在することを確認
   - イベントバブリングを考慮
   - 動的要素には委譲を使用

2. **メモリリーク**
   - イベントリスナーの適切な削除
   - 循環参照の回避
   - WeakMapの使用を検討

3. **パフォーマンス問題**
   - バリデーションのデバウンス
   - 大量DOMアクセスの最小化
   - requestAnimationFrameの使用

4. **非同期処理の競合**
   - 適切なキャンセル処理
   - 最新の結果のみを使用
   - ローディング状態の管理
