# フォームバリデーションライブラリ設計書

## 1. 概要

### 1.1 目的
本ライブラリは、Webフォームの入力値をリアルタイムで検証し、ユーザーフレンドリーなエラーフィードバックを提供することを目的とする。

### 1.2 主要機能
- リアルタイムバリデーション
- カスタマイズ可能なエラーメッセージ
- 日本語フォーム特有の入力形式対応
- 軽量で依存関係なし
- TypeScript対応
- アクセシビリティ対応

### 1.3 対象ユーザー
- フロントエンド開発者
- 日本語サイトを開発する開発者
- アクセシブルなフォームを実装したい開発者

## 2. アーキテクチャ設計

### 2.1 全体構成

```
FormValidator/
├── src/
│   ├── core/
│   │   ├── Validator.ts          # バリデーションエンジン
│   │   ├── FormManager.ts        # フォーム管理
│   │   └── EventManager.ts       # イベント管理
│   ├── validators/
│   │   ├── BaseValidator.ts      # 基底バリデーター
│   │   ├── RequiredValidator.ts  # 必須
│   │   ├── EmailValidator.ts     # メール
│   │   ├── TelValidator.ts       # 電話番号
│   │   ├── PostalCodeValidator.ts # 郵便番号
│   │   ├── TextValidator.ts      # テキスト形式
│   │   └── CustomValidator.ts    # カスタム
│   ├── ui/
│   │   ├── ErrorDisplay.ts       # エラー表示
│   │   ├── FieldState.ts         # フィールド状態管理
│   │   └── Accessibility.ts      # アクセシビリティ
│   ├── utils/
│   │   ├── Normalizer.ts         # 入力値正規化
│   │   ├── DOMHelper.ts          # DOM操作ヘルパー
│   │   └── Debounce.ts           # デバウンス処理
│   ├── types/
│   │   └── index.ts              # 型定義
│   └── index.ts                  # エントリーポイント
├── dist/                         # ビルド成果物
├── docs/                         # ドキュメント
├── examples/                     # 使用例
└── tests/                        # テスト
```

### 2.2 設計原則

#### 2.2.1 SOLID原則
- **単一責任の原則**: 各クラスは1つの責任のみを持つ
- **開放閉鎖の原則**: 拡張に対して開き、修正に対して閉じる
- **リスコフの置換原則**: 派生クラスは基底クラスと置換可能
- **インターフェース分離の原則**: 不要なメソッドへの依存を避ける
- **依存性逆転の原則**: 具象クラスではなく抽象に依存

#### 2.2.2 デザインパターン
- **Strategy Pattern**: バリデーションルールの切り替え
- **Observer Pattern**: 状態変更の通知
- **Factory Pattern**: バリデーターの生成
- **Decorator Pattern**: バリデーションルールの組み合わせ

## 3. 詳細設計

### 3.1 コアコンポーネント

#### 3.1.1 Validator（バリデーションエンジン）
```typescript
interface IValidator {
  validate(value: any, options?: ValidatorOptions): ValidationResult;
  setNext(validator: IValidator): IValidator;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

interface ValidationError {
  code: string;
  message: string;
  field?: string;
  metadata?: Record<string, any>;
}
```

#### 3.1.2 FormManager（フォーム管理）
```typescript
interface IFormManager {
  registerField(field: HTMLElement, rules: ValidationRule[]): void;
  unregisterField(field: HTMLElement): void;
  validateField(field: HTMLElement): Promise<ValidationResult>;
  validateForm(): Promise<FormValidationResult>;
  getFieldState(field: HTMLElement): FieldState;
  reset(): void;
}

interface FieldState {
  value: any;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  errors: ValidationError[];
}
```

#### 3.1.3 EventManager（イベント管理）
```typescript
interface IEventManager {
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  emit(event: string, data?: any): void;
}

type EventHandler = (data?: any) => void;

// イベントタイプ
enum ValidationEvents {
  FIELD_VALIDATED = 'field:validated',
  FORM_VALIDATED = 'form:validated',
  FIELD_CHANGED = 'field:changed',
  FIELD_FOCUSED = 'field:focused',
  FIELD_BLURRED = 'field:blurred'
}
```

### 3.2 バリデーター設計

#### 3.2.1 基底バリデーター
```typescript
abstract class BaseValidator implements IValidator {
  protected next: IValidator | null = null;
  
  abstract validate(value: any, options?: ValidatorOptions): ValidationResult;
  
  setNext(validator: IValidator): IValidator {
    this.next = validator;
    return validator;
  }
  
  protected handleNext(value: any, options?: ValidatorOptions): ValidationResult {
    if (this.next) {
      return this.next.validate(value, options);
    }
    return { isValid: true, errors: [] };
  }
}
```

#### 3.2.2 バリデーションルール
```typescript
interface ValidationRule {
  type: string;
  options?: Record<string, any>;
  message?: string | ((value: any) => string);
  condition?: (value: any, formData: any) => boolean;
}

// ルール例
const rules: ValidationRule[] = [
  {
    type: 'required',
    message: '必須項目です'
  },
  {
    type: 'email',
    message: 'メールアドレスの形式が正しくありません'
  },
  {
    type: 'tel',
    options: { allowHyphens: true },
    message: '電話番号の形式が正しくありません'
  }
];
```

### 3.3 UI/UX設計

#### 3.3.1 エラー表示
```typescript
interface IErrorDisplay {
  showError(field: HTMLElement, errors: ValidationError[]): void;
  hideError(field: HTMLElement): void;
  showSummary(errors: FormValidationError[]): void;
  hideSummary(): void;
}

// エラー表示オプション
interface ErrorDisplayOptions {
  position: 'inline' | 'tooltip' | 'summary';
  animation: boolean;
  showIcon: boolean;
  ariaLive: 'polite' | 'assertive';
}
```

#### 3.3.2 アクセシビリティ
```typescript
interface IAccessibility {
  announceError(message: string): void;
  setFieldValidity(field: HTMLElement, isValid: boolean): void;
  setFieldDescription(field: HTMLElement, description: string): void;
  manageFocus(field: HTMLElement): void;
}
```

### 3.4 設定とカスタマイズ

#### 3.4.1 グローバル設定
```typescript
interface FormValidatorConfig {
  // バリデーション設定
  validateOn: ('blur' | 'change' | 'input' | 'submit')[];
  debounceDelay: number;
  
  // エラー表示設定
  errorDisplay: ErrorDisplayOptions;
  
  // メッセージ設定
  messages: Record<string, string | MessageFunction>;
  
  // 地域設定
  locale: string;
  
  // フォーマット設定
  formats: {
    tel?: TelFormat;
    postalCode?: PostalCodeFormat;
    date?: DateFormat;
  };
  
  // カスタムバリデーター
  customValidators: Record<string, CustomValidator>;
  
  // コールバック
  onFieldValidated?: (field: HTMLElement, result: ValidationResult) => void;
  onFormValidated?: (result: FormValidationResult) => void;
}
```

#### 3.4.2 フィールド個別設定
```typescript
interface FieldConfig {
  rules: ValidationRule[];
  messages?: Record<string, string>;
  validateOn?: ('blur' | 'change' | 'input')[];
  dependsOn?: string[]; // 依存フィールド
  transform?: (value: any) => any;
}
```

## 4. API設計

### 4.1 初期化API
```typescript
// 基本的な使用方法
const validator = new FormValidator(formElement, {
  validateOn: ['blur', 'change'],
  messages: {
    required: '入力してください'
  }
});

// 高度な使用方法
const validator = new FormValidator(formElement, {
  validateOn: ['blur'],
  debounceDelay: 300,
  errorDisplay: {
    position: 'inline',
    animation: true
  },
  customValidators: {
    asyncEmail: new AsyncEmailValidator()
  },
  onFieldValidated: (field, result) => {
    console.log(`Field ${field.name} validated:`, result);
  }
});
```

### 4.2 フィールド登録API
```typescript
// HTML属性による登録
<input 
  type="email" 
  data-validate="required|email" 
  data-validate-messages='{"required": "メールアドレスを入力してください"}'
/>

// プログラマティックな登録
validator.addField('email', {
  rules: [
    { type: 'required' },
    { type: 'email' }
  ],
  messages: {
    required: 'メールアドレスを入力してください'
  }
});
```

### 4.3 バリデーション実行API
```typescript
// 単一フィールドのバリデーション
const result = await validator.validateField('email');

// フォーム全体のバリデーション
const formResult = await validator.validateForm();

// 条件付きバリデーション
const result = await validator.validateField('email', {
  force: true, // キャッシュを無視
  silent: true  // UIを更新しない
});
```

### 4.4 状態管理API
```typescript
// フィールド状態の取得
const state = validator.getFieldState('email');
console.log(state.isValid, state.errors);

// フォーム状態の取得
const formState = validator.getFormState();
console.log(formState.isValid, formState.fields);

// 状態のリセット
validator.reset(); // 全フィールド
validator.resetField('email'); // 特定フィールド
```

### 4.5 イベントAPI
```typescript
// イベントリスナーの登録
validator.on('field:validated', (event) => {
  console.log(`Field ${event.field} validated:`, event.result);
});

validator.on('form:submitted', async (event) => {
  if (event.isValid) {
    await submitForm(event.data);
  }
});

// カスタムイベントの発火
validator.emit('custom:event', { data: 'value' });
```

## 5. 実装計画

### 5.1 フェーズ1: コア機能（2週間）
- [ ] 基本的なバリデーションエンジン
- [ ] 必須、メール、電話番号バリデーター
- [ ] 基本的なエラー表示
- [ ] 単体テスト

### 5.2 フェーズ2: 高度な機能（2週間）
- [ ] 非同期バリデーション
- [ ] 条件付きバリデーション
- [ ] カスタムバリデーター
- [ ] 国際化対応

### 5.3 フェーズ3: UI/UX改善（1週間）
- [ ] アニメーション
- [ ] アクセシビリティ対応
- [ ] タッチデバイス対応
- [ ] パフォーマンス最適化

### 5.4 フェーズ4: ドキュメント・配布（1週間）
- [ ] APIドキュメント
- [ ] 使用例の作成
- [ ] npm パッケージ化
- [ ] CDN配布

## 6. テスト戦略

### 6.1 単体テスト
- 各バリデーターの動作確認
- エッジケースのテスト
- エラーハンドリング

### 6.2 統合テスト
- フォーム全体の動作確認
- イベント連携のテスト
- 非同期処理のテスト

### 6.3 E2Eテスト
- 実際のフォーム操作シナリオ
- ブラウザ互換性テスト
- パフォーマンステスト

## 7. パフォーマンス目標

- 初期化: < 10ms
- フィールドバリデーション: < 5ms
- フォーム全体バリデーション: < 50ms（10フィールド）
- メモリ使用量: < 500KB
- バンドルサイズ: < 20KB（gzip）

## 8. ブラウザサポート

- Chrome/Edge: 最新2バージョン
- Firefox: 最新2バージョン
- Safari: 最新2バージョン
- iOS Safari: iOS 12+
- Android Chrome: Android 8+

## 9. 今後の拡張計画

- Vue.js/React/Angular用ラッパー
- サーバーサイドバリデーション連携
- フォームビルダー
- A/Bテスト機能
- 分析機能
