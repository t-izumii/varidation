# Varidation - フォームバリデーションライブラリ

[![License: Commercial](https://img.shields.io/badge/License-Commercial-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-yellow.svg)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Price](https://img.shields.io/badge/Price-¥980-green.svg)](https://your-purchase-site.com)

日本語フォームに特化した、軽量で使いやすいバリデーションライブラリです。

## 📋 目次

1. [概要](#1-概要)
2. [特徴](#2-特徴)
3. [インストール](#3-インストール)
4. [クイックスタート](#4-クイックスタート)
5. [基本的な使用方法](#5-基本的な使用方法)
6. [除外エリア機能](#6-除外エリア機能)
7. [高度な機能](#7-高度な機能)
8. [API リファレンス](#8-api-リファレンス)
9. [カスタマイズ](#9-カスタマイズ)
10. [サンプル集](#10-サンプル集)
11. [ブラウザサポート](#11-ブラウザサポート)
12. [開発・コントリビューション](#12-開発コントリビューション)

---

## 1. 概要

Varidationは、現代のWebアプリケーション開発で求められるフォームバリデーション機能を提供する軽量なJavaScriptライブラリです。

### 1.1 目的
- Webフォームの入力値をリアルタイムで検証
- ユーザーフレンドリーなエラーフィードバック
- 日本語フォーム特有の入力形式に対応
- 開発者が簡単に導入・カスタマイズできる設計

### 1.2 対象ユーザー
- フロントエンド開発者
- 日本語サイトを開発する開発者
- アクセシブルなフォームを実装したい開発者

---

## 2. 特徴

✅ **軽量** - 20KB未満（gzip圧縮）  
✅ **依存関係なし** - 純粋なJavaScript  
✅ **TypeScript対応** - 型定義ファイル付属  
✅ **日本語対応** - 電話番号、郵便番号、カナ文字など  
✅ **リアルタイムバリデーション** - blur/change/inputイベント対応  
✅ **カスタマイズ可能** - エラーメッセージ、バリデーションルール  
✅ **アクセシビリティ対応** - WCAG準拠  
✅ **除外エリア機能** - 動的なバリデーション対象制御  
✅ **非同期バリデーション** - API連携による重複チェックなど  

### 2.1 パフォーマンス指標
- 初期化: < 10ms
- フィールドバリデーション: < 5ms
- フォーム全体バリデーション: < 50ms（10フィールド）
- メモリ使用量: < 500KB
- バンドルサイズ: < 20KB（gzip）

---

## 3. インストール

### 3.1 npm/yarn
```bash
npm install varidation
# または
yarn add varidation
```

### 3.2 CDN
```html
<script src="https://unpkg.com/varidation@latest/dist/FormValidator.min.js"></script>
```

### 3.3 ダウンロード
[Releases](https://github.com/your-org/varidation/releases)からダウンロードして、プロジェクトに含めてください。

---

## 4. クイックスタート

### 4.1 基本的なHTMLフォーム
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Varidation クイックスタート</title>
    <script src="https://unpkg.com/varidation@latest/dist/FormValidator.min.js"></script>
</head>
<body>
    <form id="contactForm">
        <div>
            <label for="name">お名前（必須）</label>
            <input type="text" id="name" name="name" data-validate="required">
        </div>
        
        <div>
            <label for="email">メールアドレス（必須）</label>
            <input type="email" id="email" name="email" data-validate="required,email">
        </div>
        
        <div>
            <p>必須項目: <span data-count_validate></span></p>
            <button type="submit">送信</button>
        </div>
    </form>

    <script>
        FormValidator.init({
            validation: {
                validateOnInput: false,
                validateOnBlur: true,
                debounceDelay: 500
    }
});

const validator = formValidator.validationEngine.validator;

// カスタムバリデーター登録
validator.registerCustomValidator(
    'checkUsername',
    async (value) => {
        if (!value) return true;
        // 実際のAPI呼び出しをシミュレート
        await new Promise(resolve => setTimeout(resolve, 500));
        return !['admin', 'root', 'test'].includes(value.toLowerCase());
    },
    'このユーザー名は使用できません'
);

validator.registerCustomValidator(
    'checkEmail',
    async (value) => {
        if (!value) return true;
        // 実際のAPI呼び出しをシミュレート
        await new Promise(resolve => setTimeout(resolve, 800));
        return Math.random() > 0.3; // 70%の確率で利用可能
    },
    'このメールアドレスは既に使用されています'
);

validator.registerCustomValidator(
    'strongPassword',
    async (value) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(value);
    },
    'パスワードは8文字以上で、大文字・小文字・数字・記号を含む必要があります'
);
</script>
```

---

## 11. ブラウザサポート

### 11.1 デスクトップブラウザ
- Chrome: 最新2バージョン
- Firefox: 最新2バージョン
- Safari: 最新2バージョン
- Edge: 最新2バージョン

### 11.2 モバイルブラウザ
- iOS Safari: iOS 12+
- Chrome for Android: Android 8+
- Samsung Internet: 最新2バージョン

### 11.3 必要なブラウザ機能
- ES2020対応
- Promise/async-await
- WeakMap
- dataset API
- addEventListener

---

## 12. 開発・コントリビューション

### 12.1 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/your-org/varidation.git
cd varidation

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# テスト実行
npm test

# TypeScript型チェック
npm run type-check

# リント
npm run lint
```

### 12.2 プロジェクト構造

```
src/
├── core/                 # コアクラス
│   ├── FormManager.ts    # メインのフォーム管理クラス
│   ├── Validator.ts      # バリデーションエンジン
│   ├── ValidationEngine.ts
│   ├── FieldStateManager.ts
│   ├── ErrorDisplayManager.ts
│   ├── AccessibilityManager.ts
│   └── EventManager.ts
├── validators/           # バリデータークラス群
│   ├── BaseValidator.ts  # 基底クラス
│   ├── RequiredValidator.ts
│   ├── EmailValidator.ts
│   ├── TelValidator.ts
│   ├── PostalCodeValidator.ts
│   ├── TextValidator.ts
│   ├── CustomValidator.ts
│   └── index.ts
├── ui/                   # UI関連クラス
│   ├── FieldState.ts
│   ├── ErrorDisplay.ts
│   └── Accessibility.ts
├── utils/                # ユーティリティクラス
│   ├── DOMHelper.ts
│   ├── Debounce.ts
│   ├── EventManager.ts
│   └── Normalizer.ts
├── events/               # イベント定義
│   └── ValidationEvents.ts
├── types/                # TypeScript型定義
│   └── index.ts
├── tests/                # テストファイル（TODO）
└── index.ts              # エントリーポイント
```

### 12.3 アーキテクチャ概要

#### 12.3.1 設計思想
- **単一責任の原則**: 各クラスは明確に定義された責任を持つ
- **依存性注入**: 疎結合な設計により、テストとメンテナンスを容易にする
- **Chain of Responsibility**: バリデーターチェーンによる柔軟な組み合わせ
- **Observer Pattern**: イベント駆動による拡張可能性

#### 12.3.2 主要コンポーネント

**FormManager**
- フォーム全体の管理を行うメインクラス
- 各マネージャークラスを統合し、バリデーション処理を調整
- 除外エリア機能の制御

**Validator**
- バリデーターの登録と実行を管理
- 各バリデータークラスのチェーン構築
- カスタムバリデーターの登録機能

**BaseValidator**
- 全バリデーターの基底クラス
- Chain of Responsibilityパターンの実装
- 共通のエラーハンドリング機能

### 12.4 新しいバリデーターの追加方法

```typescript
// 新しいバリデータークラスの作成例
import { BaseValidator } from './BaseValidator';
import { ValidationResult, ValidatorOptions } from '../types';

export class UrlValidator extends BaseValidator {
    private urlPattern = /^https?:\/\/.+/;
    private defaultMessage = '有効なURLを入力してください。';

    async validate(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        // 空の場合はスキップ（RequiredValidatorで処理）
        if (this.isEmpty(value)) {
            return await this.handleNext(value, options);
        }

        // 文字列に変換
        const conversionResult = this.convertToString(value, 'url', this.defaultMessage, options);
        if (!conversionResult.success) {
            return conversionResult.result;
        }
        const stringValue = conversionResult.value;

        // URL形式をチェック
        if (!this.urlPattern.test(stringValue)) {
            const message = this.createErrorMessage('url', this.defaultMessage, options);
            return this.createFailureResult([
                this.createError('url', message, value)
            ]);
        }

        // 検証成功、次のバリデーターへ
        return await this.handleNext(stringValue, options);
    }
}
```

```typescript
// Validatorクラスに登録
// src/core/Validator.ts の registerDefaultValidators() メソッドに追加
this.registerValidatorFactory('url', () => new UrlValidator());
```

### 12.5 テストの実装（TODO）

```typescript
// src/tests/validators/UrlValidator.test.ts の例
import { UrlValidator } from '../../validators/UrlValidator';

describe('UrlValidator', () => {
    let validator: UrlValidator;
    
    beforeEach(() => {
        validator = new UrlValidator();
    });
    
    test('有効なURLの場合、バリデーションが成功する', async () => {
        const result = await validator.validate('https://example.com');
        expect(result.isValid).toBe(true);
    });
    
    test('無効なURLの場合、バリデーションが失敗する', async () => {
        const result = await validator.validate('invalid-url');
        expect(result.isValid).toBe(false);
        expect(result.errors[0].rule).toBe('url');
    });
});
```

### 12.6 コントリビューションガイドライン

#### 12.6.1 プルリクエストの流れ

1. **Issue の作成**: 新機能やバグ修正の前に、Issueで議論
2. **フォーク**: リポジトリをフォークし、feature ブランチを作成
3. **実装**: コーディング規約に従って実装
4. **テスト**: 新機能には対応するテストを追加
5. **プルリクエスト**: 詳細な説明と共にPRを作成

#### 12.6.2 コーディング規約

```typescript
// ✅ Good: 明確なクラス名と責任分離
export class EmailValidator extends BaseValidator {
    private emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    async validate(value: any, options?: ValidatorOptions): Promise<ValidationResult> {
        // 実装
    }
}

// ❌ Bad: 責任が不明確
export class Validator {
    validateEmail(value: string): boolean {
        // 実装
    }
    
    validatePhone(value: string): boolean {
        // 実装
    }
}
```

#### 12.6.3 コメント規約

```typescript
/**
 * フィールドの現在の状態を表すインターフェース
 * バリデーション結果や変更状態などを管理
 */
export interface FieldState {
  value: string;                         // 現在の値
  isValid: boolean;                      // バリデーション状態（成功/失敗）
  errors: ValidationError[];             // 現在のエラー配列
  isDirty: boolean;                      // 初期値から変更されたかどうか
  isTouched?: boolean;                   // ユーザーがフィールドに触れたかどうか（オプション）
}
```

### 12.7 ライセンス

Varidationは[MITライセンス](LICENSE)の下で配布されています。

### 12.8 サポート

- **GitHub Issues**: [バグ報告・機能要求](https://github.com/your-org/varidation/issues)
- **ドキュメント**: [公式ドキュメント](https://varidation-docs.netlify.app)
- **NPMパッケージ**: [npmjs.com](https://www.npmjs.com/package/varidation)
- **TypeScript型定義**: 本体に含まれています

---

## まとめ

Varidationは、日本語フォームに特化した軽量で使いやすいバリデーションライブラリです。

### 主な特徴
- 🚀 **簡単導入**: HTMLにdata属性を追加するだけで動作
- 🎯 **日本語対応**: 電話番号、郵便番号、カナ文字など日本語特有の形式に対応
- ⚡ **高性能**: 軽量で高速、メモリ効率も良好
- 🔧 **カスタマイズ性**: 豊富な設定オプションとカスタムバリデーター
- ♿ **アクセシビリティ**: WCAG準拠のアクセシブルなバリデーション
- 📱 **レスポンシブ**: デスクトップ・モバイル両対応
- 🎨 **除外エリア機能**: 動的なフォーム要件に対応
- ⚙️ **TypeScript**: 完全な型サポートによる開発効率向上

### 今後のロードマップ
- [ ] 追加バリデーター（URL、数値範囲、正規表現パターンなど）
- [ ] フレームワーク連携（Vue.js、React、Angular）
- [ ] 包括的なテストスイート
- [ ] サーバーサイドバリデーション連携
- [ ] ビジュアルフォームビルダー
- [ ] AI駆動の最適化機能
- [ ] パフォーマンス監視とメトリクス

### バージョン情報
- **現在のバージョン**: 1.0.0-beta
- **最新の安定版**: 未リリース
- **Node.js要件**: Node.js 14+
- **TypeScript要件**: TypeScript 4.5+

継続的な改善とコミュニティフィードバックにより、より良いライブラリへと進化していきます。

---

### 4.2 ES6 モジュール
```javascript
import { FormValidator } from 'varidation';

const validator = FormValidator.init({
    validation: {
        validateOnInput: false,
        validateOnBlur: true,
        debounceDelay: 300
    },
    customMessages: {
        required: 'この項目は必須です'
    }
});
```

---

## 5. 基本的な使用方法

### 5.1 データ属性によるバリデーション設定

#### 基本的なバリデーションルール
```html
<!-- 必須項目 -->
<input type="text" name="name" data-validate="required">

<!-- 複数ルール（カンマ区切り） -->
<input type="email" name="email" data-validate="required,email">

<!-- 日本語対応 -->
<input type="tel" name="phone" data-validate="required,tel">
<input type="text" name="postal" data-validate="required,postal-code">
<input type="text" name="kana" data-validate="required,katakana">

<!-- 値の自動置換（全角数字→半角数字） -->
<input type="tel" name="phone" data-validate="required,tel,replace">
```

#### グループバリデーション
```html
<!-- チェックボックスグループ -->
<div data-check_validate="required">
    <label><input type="checkbox" name="services[]" value="web"> Webサイト制作</label>
    <label><input type="checkbox" name="services[]" value="app"> アプリ開発</label>
    <label><input type="checkbox" name="services[]" value="design"> デザイン</label>
</div>

<!-- ラジオボタングループ -->
<div data-radio_validate="required">
    <label><input type="radio" name="gender" value="male"> 男性</label>
    <label><input type="radio" name="gender" value="female"> 女性</label>
    <label><input type="radio" name="gender" value="other"> その他</label>
</div>

<!-- セレクトボックス -->
<select name="prefecture" data-select_validate="required">
    <option value="">都道府県を選択</option>
    <option value="tokyo">東京都</option>
    <option value="osaka">大阪府</option>
</select>

<!-- 同意チェックボックス -->
<div data-check_validate="agree">
    <label><input type="checkbox" name="agree" value="1"> 個人情報保護方針に同意する</label>
</div>
```

### 5.2 JavaScriptによる初期化

```javascript
// 基本的な初期化
const validator = FormValidator.init({
    validation: {
        validateOnInput: false,    // 入力中のバリデーション
        validateOnBlur: true,      // フォーカスアウト時のバリデーション
        debounceDelay: 300         // デバウンス遅延（ミリ秒）
    },
    errorDisplay: {
        showOnValidation: true,    // バリデーション時にエラー表示
        clearOnFocus: true,        // フォーカス時にエラークリア
        animationDuration: 200     // アニメーション時間
    },
    disableSubmitUntilValid: true  // 有効になるまで送信ボタン無効化
});

// 高度な設定
const validator = FormValidator.init({
    validation: {
        validateOnInput: true,     // リアルタイムバリデーション
        validateOnBlur: true,
        debounceDelay: 500
    },
    
    // カスタムメッセージ
    customMessages: {
        required: 'この項目は必須です',
        email: '正しいメールアドレスを入力してください',
        tel: '正しい電話番号を入力してください',
        'postal-code': '正しい郵便番号を入力してください',
        hiragana: 'ひらがなで入力してください',
        katakana: 'カタカナで入力してください'
    },
    
    // イベントハンドラー
    onFieldValidated: (data) => {
        console.log(`Field ${data.fieldId} validated:`, data.isValid);
    },
    
    onFormValidated: (data) => {
        console.log('Form validation result:', data.isValid);
    },
    
    onCountUpdated: (data) => {
        // 必須項目カウント表示のカスタム処理
        const element = document.querySelector('[data-count_validate]');
        if (element) {
            element.textContent = `${data.total - data.valid}`;
            element.className = data.isComplete ? 'complete' : 'incomplete';
        }
    }
});
```

### 5.3 利用可能なバリデーションルール

| ルール | 説明 | 例 |
|--------|------|-----|
| `required` | 必須項目 | `data-validate="required"` |
| `email` | メールアドレス形式 | `data-validate="email"` |
| `email-conf` | メール確認（一致チェック） | `data-validate="email-conf"` |
| `tel` | 電話番号形式（日本） | `data-validate="tel"` |
| `postal-code` | 郵便番号形式（日本） | `data-validate="postal-code"` |
| `number` | 数値 | `data-validate="number"` |
| `hiragana` | ひらがな | `data-validate="hiragana"` |
| `katakana` | カタカナ | `data-validate="katakana"` |
| `password` | パスワード（英数8-16文字） | `data-validate="password"` |
| `halfWidth` | 半角数字 | `data-validate="halfWidth"` |
| `replace` | 全角数字→半角変換 | `data-validate="tel,replace"` |

### 5.4 カスタムエラーメッセージ（emesse）

フィールドごとに個別のエラーメッセージを設定できます：

```html
<!-- カスタムメッセージキーを指定 -->
<input type="text" name="company" data-validate="required,emesse1">
<input type="email" name="email" data-validate="required,email,emesse2">
```

```javascript
FormValidator.init({
    customMessages: {
        emesse1: '会社名は必須入力項目です',
        emesse2: '有効な会社用メールアドレスを入力してください'
    }
});
```

---

## 6. 除外エリア機能

`data-validate-hidden` 属性を使用して、特定のエリアをバリデーション対象から動的に除外できます。

### 6.1 基本的な使用方法

```html
<!-- 除外エリア全体 -->
<div data-validate-hidden>
    <input type="text" name="company" data-validate="required">
    <input type="text" name="department" data-validate="required">
    <!-- この範囲内の必須項目はカウントされません -->
</div>

<!-- 個別フィールドの除外 -->
<input type="text" name="optional" data-validate="required" data-validate-hidden>
```

### 6.2 動的な切り替え

```javascript
function toggleArea() {
    const area = document.getElementById('companySection');
    const formManager = FormValidator.getInstance();
    
    if (area.hasAttribute('data-validate-hidden')) {
        // バリデーション対象に含める
        area.removeAttribute('data-validate-hidden');
    } else {
        // バリデーション対象から除外
        area.setAttribute('data-validate-hidden', '');
    }
    
    // カウントを手動で更新
    formManager.updateValidationCount();
}
```

### 6.3 実装例

```html
<form id="dynamicForm">
    <!-- 基本情報（常に必須） -->
    <div>
        <label for="name">お名前</label>
        <input type="text" id="name" name="name" data-validate="required">
    </div>
    
    <!-- 切り替えボタン -->
    <button type="button" onclick="toggleCompanyInfo()">
        会社情報入力の切り替え
    </button>
    
    <!-- 条件付き必須エリア -->
    <div id="companySection" data-validate-hidden>
        <h3>会社情報</h3>
        <div>
            <label for="company">会社名</label>
            <input type="text" id="company" name="company" data-validate="required">
        </div>
        <div>
            <label for="position">役職</label>
            <input type="text" id="position" name="position" data-validate="required">
        </div>
    </div>
    
    <div>
        <p>必須項目: <span data-count_validate></span></p>
        <button type="submit">送信</button>
    </div>
</form>

<script>
const formManager = FormValidator.init({
    disableSubmitUntilValid: true
});

function toggleCompanyInfo() {
    const section = document.getElementById('companySection');
    
    if (section.hasAttribute('data-validate-hidden')) {
        section.removeAttribute('data-validate-hidden');
        console.log('会社情報をバリデーション対象に含めました');
    } else {
        section.setAttribute('data-validate-hidden', '');
        console.log('会社情報をバリデーション対象から除外しました');
    }
    
    formManager.updateValidationCount();
}
</script>
```

---

## 7. 高度な機能

### 7.1 カスタムバリデーター

独自のバリデーションルールを追加できます。

```javascript
// カスタムバリデーターの登録
const formValidator = FormValidator.init();
const validator = formValidator.validationEngine.validator;

// 強いパスワードのチェック
validator.registerCustomValidator(
    'strongPassword',
    async (value) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(value);
    },
    'パスワードは8文字以上で、大文字・小文字・数字・記号を含む必要があります'
);

// 年齢制限チェック
validator.registerCustomValidator(
    'adultAge',
    async (value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 18;
    },
    '18歳以上である必要があります'
);
```

```html
<!-- カスタムバリデーターの使用 -->
<input type="password" name="password" data-validate="required,strongPassword">
<input type="date" name="birthdate" data-validate="required,adultAge">
```

### 7.2 非同期バリデーション

API通信を伴うバリデーション（重複チェックなど）も可能です。

```javascript
const formValidator = FormValidator.init({
    validation: {
        validateOnBlur: true,
        debounceDelay: 500  // API呼び出しのため遅延を長めに設定
    }
});

const validator = formValidator.validationEngine.validator;

// メールアドレス重複チェック
validator.registerCustomValidator(
    'uniqueEmail',
    async (value) => {
        if (!value) return true; // 空の場合はスキップ
        
        try {
            const response = await fetch('/api/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: value })
            });
            
            const result = await response.json();
            return result.available;
        } catch (error) {
            console.error('Email check failed:', error);
            return true; // エラー時は通す
        }
    },
    'このメールアドレスは既に登録されています'
);
```

```html
<input type="email" name="email" data-validate="required,email,uniqueEmail">
```

---

## 8. API リファレンス

### 8.1 初期化メソッド

#### `FormValidator.init(options)`

フォームバリデーターを初期化します。

**設定オプション:**

```typescript
interface FormManagerOptions {
  validation: {
    validateOnInput: boolean;      // 入力中のバリデーション（デフォルト: false）
    validateOnBlur: boolean;       // フォーカスアウト時のバリデーション（デフォルト: true）
    debounceDelay: number;         // デバウンス遅延時間（デフォルト: 300ms）
  };
  errorDisplay: {
    showOnValidation: boolean;     // バリデーション時にエラー表示（デフォルト: true）
    clearOnFocus: boolean;         // フォーカス時にエラークリア（デフォルト: true）
    animationDuration: number;     // アニメーション時間（デフォルト: 200ms）
  };
  customMessages: Record<string, string>; // カスタムエラーメッセージ
  disableSubmitUntilValid?: boolean;      // 全項目有効まで送信ボタン無効化
  onFieldValidated?: (data: FieldValidationEventData) => void;   // フィールドバリデーション完了時
  onFormValidated?: (data: FormValidationEventData) => void;     // フォームバリデーション完了時
  onCountUpdated?: (data: CountUpdateEventData) => void;         // カウント更新時
  onSubmitStateChanged?: (data: SubmitStateEventData) => void;   // 送信状態変更時
}
```

### 8.2 静的メソッド

#### `FormValidator.getInstance()`
現在のインスタンスを取得します。

#### `FormValidator.update()`
必須項目カウントを手動で更新します（除外エリア機能使用時）。

#### `FormValidator.check()`
全フィールドの一括バリデーションを実行します。

### 8.3 インスタンスメソッド

取得したインスタンス（`FormManager`）で利用可能なメソッド：

#### `validateAllFields()`
全フィールドを検証します（必須項目以外でも入力があるフィールドも対象）。

#### `updateValidationCount()`
バリデーションカウントを手動で更新します。

#### `reset()`
フォームの状態をリセットします。

#### `getFieldState(fieldId)`
フィールドの現在の状態を取得します。

#### `isFieldInHiddenArea(element)`
要素が除外エリア内かどうかを判定します。

#### `on(event, handler)` / `off(event, handler)`
イベントリスナーを追加/削除します。

### 8.4 イベントデータの型定義

```typescript
interface FieldValidationEventData {
  fieldId: string;
  field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  isValid: boolean;
  errors: string[];
}

interface FormValidationEventData {
  form: HTMLFormElement;
  isValid: boolean;
  fieldStates: Record<string, FieldState>;
}

interface CountUpdateEventData {
  valid: number;      // バリデーション済みフィールド数
  total: number;      // 必須フィールド総数
  isComplete: boolean; // 全ての必須フィールドが完了したか
}
```

---

## 9. カスタマイズ

### 9.1 エラーメッセージのカスタマイズ

```javascript
FormValidator.init({
    customMessages: {
        required: 'この項目は必須です',
        email: '正しいメールアドレスを入力してください',
        tel: '正しい電話番号を入力してください',
        'postal-code': '正しい郵便番号を入力してください',
        hiragana: 'ひらがなで入力してください',
        katakana: 'カタカナで入力してください',
        // フィールド固有のメッセージ
        emesse1: 'お名前は必須入力項目です',
        emesse2: '会社用メールアドレスを入力してください'
    }
});
```

### 9.2 スタイルカスタマイズ

Varidationは以下のCSSクラスを自動的に追加します。

```css
.validation-error {
    border-color: #e74c3c;
    background-color: #fdf2f2;
}

.validation-success {
    border-color: #27ae60;
    background-color: #f2fdf2;
}

.error-message {
    color: #e74c3c;
    font-size: 0.9em;
    margin-top: 4px;
}

/* 必須項目カウント表示 */
[data-count_validate].complete {
    color: #27ae60;
}

[data-count_validate].incomplete {
    color: #e74c3c;
}
```

### 9.3 バリデーション設定のカスタマイズ

```javascript
// 電話番号のハイフン設定
FormValidator.init({
    customMessages: {
        // ハイフンありの電話番号を強制
        tel: '電話番号はハイフン付きで入力してください（例：03-1234-5678）'
    }
});

// 郵便番号の設定も同様にカスタマイズ可能
```

---

## 10. サンプル集

### 10.1 基本的なお問い合わせフォーム

```html
<form id="contactForm">
    <div>
        <label for="name">お名前（必須）</label>
        <input type="text" id="name" name="name" data-validate="required" placeholder="山田太郎">
    </div>
    
    <div>
        <label for="furigana">ふりがな（必須）</label>
        <input type="text" id="furigana" name="furigana" data-validate="required,hiragana" placeholder="やまだたろう">
    </div>
    
    <div>
        <label for="email">メールアドレス（必須）</label>
        <input type="email" id="email" name="email" data-validate="required,email" placeholder="example@example.com">
    </div>
    
    <div>
        <label for="phone">電話番号</label>
        <input type="tel" id="phone" name="phone" data-validate="tel,replace" placeholder="03-1234-5678">
    </div>
    
    <div>
        <label for="message">お問い合わせ内容（必須）</label>
        <textarea id="message" name="message" data-validate="required" rows="5"></textarea>
    </div>
    
    <div>
        <p>必須項目の残り: <span data-count_validate></span>項目</p>
        <button type="submit">送信</button>
    </div>
</form>

<script>
FormValidator.init({
    validation: {
        validateOnInput: false,
        validateOnBlur: true,
        debounceDelay: 300
    },
    disableSubmitUntilValid: true,
    customMessages: {
        required: 'この項目は必須です',
        email: '正しいメールアドレスを入力してください',
        tel: '正しい電話番号を入力してください',
        hiragana: 'ひらがなで入力してください'
    }
});
</script>
```ティ対応** - WCAG準拠  
✅ **除外エリア機能** - 動的なバリデーション対象制御  
✅ **非同期バリデーション** - API連携による重複チェックなど  

### 2.1 パフォーマンス指標
- 初期化: < 10ms
- フィールドバリデーション: < 5ms
- フォーム全体バリデーション: < 50ms（10フィールド）
- メモリ使用量: < 500KB
- バンドルサイズ: < 20KB（gzip）

---

## 3. インストール

### 3.1 npm/yarn
```bash
npm install varidation
# または
yarn add varidation
```

### 3.2 CDN
```html
<script src="https://unpkg.com/varidation@latest/dist/FormValidator.min.js"></script>
```

### 3.3 ダウンロード
[Releases](https://github.com/your-org/varidation/releases)からダウンロードして、プロジェクトに含めてください。

---

## 4. クイックスタート

### 4.1 基本的なHTMLフォーム
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Varidation クイックスタート</title>
    <script src="https://unpkg.com/varidation@latest/dist/FormValidator.min.js"></script>
</head>
<body>
    <form id="contactForm">
        <div>
            <label for="name">お名前（必須）</label>
            <input type="text" id="name" name="name" data-validate="required">
        </div>
        
        <div>
            <label for="email">メールアドレス（必須）</label>
            <input type="email" id="email" name="email" data-validate="required|email">
        </div>
        
        <button type="submit">送信</button>
    </form>

    <script>
        FormValidator.init({
            validateOn: ['blur', 'change'],
            count: true,
            disableSubmitUntilValid: true
        });
    </script>
</body>
</html>
```

### 4.2 ES6 モジュール
```javascript
import { FormValidator } from 'varidation';

const validator = FormValidator.init({
    validateOn: ['blur', 'change'],
    count: true,
    messages: {
        required: 'この項目は必須です'
    }
});
```

---

## 5. 基本的な使用方法

### 5.1 データ属性によるバリデーション設定

#### 基本的なバリデーションルール
```html
<!-- 必須項目 -->
<input type="text" name="name" data-validate="required">

<!-- 複数ルール -->
<input type="email" name="email" data-validate="required|email">

<!-- 長さ制限 -->
<input type="text" name="message" data-validate="required|minlength:10|maxlength:500">

<!-- 日本語対応 -->
<input type="tel" name="phone" data-validate="tel">
<input type="text" name="postal" data-validate="postalcode">
<input type="text" name="kana" data-validate="katakana">
```

#### グループバリデーション
```html
<!-- チェックボックスグループ -->
<div data-check_validate="required">
    <label><input type="checkbox" name="services[]" value="web"> Webサイト制作</label>
    <label><input type="checkbox" name="services[]" value="app"> アプリ開発</label>
    <label><input type="checkbox" name="services[]" value="design"> デザイン</label>
</div>

<!-- ラジオボタングループ -->
<div data-radio_validate="required">
    <label><input type="radio" name="gender" value="male"> 男性</label>
    <label><input type="radio" name="gender" value="female"> 女性</label>
    <label><input type="radio" name="gender" value="other"> その他</label>
</div>

<!-- セレクトボックス -->
<select name="prefecture" data-select_validate="required">
    <option value="">都道府県を選択</option>
    <option value="tokyo">東京都</option>
    <option value="osaka">大阪府</option>
</select>
```

### 5.2 JavaScriptによる初期化

```javascript
// 基本的な初期化
const validator = FormValidator.init({
    validateOn: ['blur', 'change'],
    count: true,
    disableSubmitUntilValid: true
});

// 高度な設定
const validator = FormValidator.init({
    validateOn: ['blur', 'change'],
    debounceDelay: 300,
    count: true,
    disableSubmitUntilValid: true,
    
    // カスタムメッセージ
    messages: {
        required: 'この項目は必須です',
        email: '正しいメールアドレスを入力してください',
        tel: '正しい電話番号を入力してください'
    },
    
    // イベントハンドラー
    onFieldValidated: (field, result) => {
        console.log(`Field ${field.name} validated:`, result);
    },
    
    onFormValidated: (result) => {
        console.log('Form validation result:', result);
    }
});
```

### 5.3 利用可能なバリデーションルール

| ルール | 説明 | 例 |
|--------|------|-----|
| `required` | 必須項目 | `data-validate="required"` |
| `email` | メールアドレス形式 | `data-validate="email"` |
| `tel` | 電話番号形式（日本） | `data-validate="tel"` |
| `postalcode` | 郵便番号形式（日本） | `data-validate="postalcode"` |
| `url` | URL形式 | `data-validate="url"` |
| `number` | 数値 | `data-validate="number"` |
| `integer` | 整数 | `data-validate="integer"` |
| `minlength:n` | 最小文字数 | `data-validate="minlength:8"` |
| `maxlength:n` | 最大文字数 | `data-validate="maxlength:100"` |
| `min:n` | 最小値 | `data-validate="min:0"` |
| `max:n` | 最大値 | `data-validate="max:999"` |
| `pattern:regex` | 正規表現パターン | `data-validate="pattern:^[A-Z]+$"` |
| `hiragana` | ひらがな | `data-validate="hiragana"` |
| `katakana` | カタカナ | `data-validate="katakana"` |
| `alpha` | 英字のみ | `data-validate="alpha"` |
| `alphanumeric` | 英数字のみ | `data-validate="alphanumeric"` |

---

## 6. 除外エリア機能

`data-validate-hidden` 属性を使用して、特定のエリアをバリデーション対象から動的に除外できます。

### 6.1 基本的な使用方法

```html
<!-- 除外エリア全体 -->
<div data-validate-hidden>
    <input type="text" name="company" data-validate="required">
    <input type="text" name="department" data-validate="required">
    <!-- この範囲内の必須項目はカウントされません -->
</div>

<!-- 個別フィールドの除外 -->
<input type="text" name="optional" data-validate="required" data-validate-hidden>
```

### 6.2 動的な切り替え

```javascript
function toggleArea() {
    const area = document.getElementById('companySection');
    const formManager = FormValidator.getInstance();
    
    if (area.hasAttribute('data-validate-hidden')) {
        // バリデーション対象に含める
        area.removeAttribute('data-validate-hidden');
    } else {
        // バリデーション対象から除外
        area.setAttribute('data-validate-hidden', '');
    }
    
    // カウントを手動で更新
    formManager.updateValidationCount();
}
```

### 6.3 実装例

```html
<form id="dynamicForm">
    <!-- 基本情報（常に必須） -->
    <div>
        <label for="name">お名前</label>
        <input type="text" id="name" name="name" data-validate="required">
    </div>
    
    <!-- 切り替えボタン -->
    <button type="button" onclick="toggleCompanyInfo()">
        会社情報入力の切り替え
    </button>
    
    <!-- 条件付き必須エリア -->
    <div id="companySection" data-validate-hidden>
        <h3>会社情報</h3>
        <div>
            <label for="company">会社名</label>
            <input type="text" id="company" name="company" data-validate="required">
        </div>
        <div>
            <label for="position">役職</label>
            <input type="text" id="position" name="position" data-validate="required">
        </div>
    </div>
    
    <div>
        <p>必須項目: <span id="validationCount"></span></p>
        <button type="submit">送信</button>
    </div>
</form>

<script>
const formManager = FormValidator.init({
    count: true,
    disableSubmitUntilValid: true
});

function toggleCompanyInfo() {
    const section = document.getElementById('companySection');
    
    if (section.hasAttribute('data-validate-hidden')) {
        section.removeAttribute('data-validate-hidden');
        console.log('会社情報をバリデーション対象に含めました');
    } else {
        section.setAttribute('data-validate-hidden', '');
        console.log('会社情報をバリデーション対象から除外しました');
    }
    
    formManager.updateValidationCount();
}
</script>
```

---

## 7. 高度な機能

### 7.1 カスタムバリデーター

独自のバリデーションルールを追加できます。

```javascript
FormValidator.init({
    customValidators: {
        // 強いパスワードのチェック
        strongPassword: {
            validator: (value) => {
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                return regex.test(value);
            },
            message: 'パスワードは8文字以上で、大文字・小文字・数字・記号を含む必要があります'
        },
        
        // パスワード一致チェック
        matchPassword: {
            validator: (value) => {
                const password = document.getElementById('password').value;
                return value === password;
            },
            message: 'パスワードが一致しません'
        },
        
        // 年齢制限チェック
        adultAge: {
            validator: (value) => {
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                return age >= 18;
            },
            message: '18歳以上である必要があります'
        }
    }
});
```

### 7.2 非同期バリデーション

API通信を伴うバリデーション（重複チェックなど）も可能です。

```javascript
FormValidator.init({
    debounceDelay: 500, // 入力後500ms待機
    customValidators: {
        uniqueEmail: {
            validator: async (value) => {
                if (!value) return true; // 空の場合はスキップ
                
                try {
                    const response = await fetch('/api/check-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: value })
                    });
                    
                    const result = await response.json();
                    return result.available;
                } catch (error) {
                    console.error('Email check failed:', error);
                    return true; // エラー時は通す
                }
            },
            message: 'このメールアドレスは既に登録されています'
        }
    }
});
```

---

## 8. API リファレンス

### 8.1 初期化メソッド

#### `FormValidator.init(options)`

フォームバリデーターを初期化します。

**設定オプション:**

| オプション | 型 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `validateOn` | Array | `['blur', 'change']` | バリデーションタイミング |
| `debounceDelay` | Number | `0` | デバウンス遅延時間（ms） |
| `count` | Boolean | `false` | 必須項目カウント表示 |
| `disableSubmitUntilValid` | Boolean | `false` | 全項目有効まで送信ボタン無効化 |
| `messages` | Object | `{}` | カスタムエラーメッセージ |
| `customValidators` | Object | `{}` | カスタムバリデーター |
| `onFieldValidated` | Function | `null` | フィールドバリデーション完了時コールバック |
| `onFormValidated` | Function | `null` | フォームバリデーション完了時コールバック |

### 8.2 インスタンスメソッド

#### `validateField(fieldId)`
指定されたフィールドをバリデーションします。

#### `validateForm()`
フォーム全体をバリデーションします。

#### `updateValidationCount()`
バリデーションカウントを手動で更新します（除外エリア機能使用時）。

#### `reset()`
フォームの状態をリセットします。

#### `getFieldState(fieldId)`
フィールドの現在の状態を取得します。

---

## 9. カスタマイズ

### 9.1 エラーメッセージのカスタマイズ

```javascript
FormValidator.init({
    messages: {
        required: 'この項目は必須です',
        email: '正しいメールアドレスを入力してください',
        tel: '正しい電話番号を入力してください'
    }
});
```

### 9.2 スタイルカスタマイズ

Varidationは以下のCSSクラスを自動的に追加します。

```css
.validation-error {
    border-color: #e74c3c;
    background-color: #fdf2f2;
}

.validation-success {
    border-color: #27ae60;
    background-color: #f2fdf2;
}

.error-message {
    color: #e74c3c;
    font-size: 0.9em;
    margin-top: 4px;
}

.validation-count.complete {
    color: #27ae60;
}

.validation-count.incomplete {
    color: #e74c3c;
}
```

---

## 10. サンプル集

### 10.1 基本的なフォーム

```html
<form id="basicForm">
    <div>
        <label for="name">お名前</label>
        <input type="text" id="name" name="name" data-validate="required">
    </div>
    
    <div>
        <label for="email">メールアドレス</label>
        <input type="email" id="email" name="email" data-validate="required|email">
    </div>
    
    <div>
        <label for="phone">電話番号</label>
        <input type="tel" id="phone" name="phone" data-validate="tel">
    </div>
    
    <button type="submit">送信</button>
</form>

<script>
FormValidator.init({
    validateOn: ['blur', 'change'],
    count: true,
    disableSubmitUntilValid: true
});
</script>
```

### 10.2 除外エリア付きフォーム

```html
<form id="dynamicForm">
    <div>
        <label for="name">お名前</label>
        <input type="text" id="name" name="name" data-validate="required">
    </div>
    
    <button type="button" onclick="toggleCompany()">会社情報の切り替え</button>
    
    <div id="companyArea" data-validate-hidden>
        <div>
            <label for="company">会社名</label>
            <input type="text" id="company" name="company" data-validate="required">
        </div>
    </div>
    
    <div>
        <p>必須項目: <span id="validationCount"></span></p>
        <button type="submit">送信</button>
    </div>
</form>

<script>
const formManager = FormValidator.init({
    count: true,
    disableSubmitUntilValid: true
});

function toggleCompany() {
    const area = document.getElementById('companyArea');
    if (area.hasAttribute('data-validate-hidden')) {
        area.removeAttribute('data-validate-hidden');
    } else {
        area.setAttribute('data-validate-hidden', '');
    }
    formManager.updateValidationCount();
}
</script>
```

---

## 11. ブラウザサポート

### 11.1 デスクトップブラウザ
- Chrome: 最新2バージョン
- Firefox: 最新2バージョン
- Safari: 最新2バージョン
- Edge: 最新2バージョン

### 11.2 モバイルブラウザ
- iOS Safari: iOS 12+
- Chrome for Android: Android 8+
- Samsung Internet: 最新2バージョン

---

## 12. 開発・コントリビューション

### 12.1 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/your-org/varidation.git
cd varidation

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# テスト実行
npm test
```

### 12.2 ライセンス

Varidationは商用ライセンス（買い切り980円）で提供されています。

**ライセンス内容:**
- 個人・法人問わず商用利用可能
- プロジェクト数制限なし
- 永続利用権（期限なし）
- 無料アップデート提供
- 技術サポート付き

詳細は[ライセンス条項](LICENSE)をご確認ください。

### 12.3 サポート

- **GitHub Issues**: [バグ報告・機能要求](https://github.com/your-org/varidation/issues)
- **ドキュメント**: [公式ドキュメント](https://varidation-docs.netlify.app)
- **NPMパッケージ**: [npmjs.com](https://www.npmjs.com/package/varidation)

---

## まとめ

Varidationは、日本語フォームに特化した軽量で使いやすいバリデーションライブラリです。

### 主な特徴
- 🚀 **簡単導入**: HTMLにdata属性を追加するだけで動作
- 🎯 **日本語対応**: 電話番号、郵便番号、カナ文字など日本語特有の形式に対応
- ⚡ **高性能**: 軽量で高速、メモリ効率も良好
- 🔧 **カスタマイズ性**: 豊富な設定オプションとカスタムバリデーター
- ♿ **アクセシビリティ**: WCAG準拠のアクセシブルなバリデーション
- 📱 **レスポンシブ**: デスクトップ・モバイル両対応
- 🎨 **除外エリア機能**: 動的なフォーム要件に対応

### 今後の展開
- フレームワーク連携（Vue.js、React、Angular）
- サーバーサイドバリデーション連携
- ビジュアルフォームビルダー
- AI駆動の最適化機能

継続的な改善とコミュニティフィードバックにより、より良いライブラリへと進化していきます。

---

**Varidation** - より良いWebフォーム体験を、すべての開発者に。