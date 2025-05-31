# FormValidator 機能追加サマリー

## 追加された機能

### 1. 手動カウント更新機能（manualUpdateCount）
- **概要**: HTMLから直接呼び出し可能な手動カウント更新関数
- **機能**: 除外エリア（`data-validate-hidden`）を考慮した必須フィールドのカウント
- **使用方法**: 
  ```javascript
  // グローバル関数として使用
  window.manualUpdateCount();
  
  // FormValidator経由で使用
  FormValidator.manualUpdateCount();
  ```

### 2. update関数
- **概要**: count、disableSubmitUntilValidの必須の数を再チェック
- **機能**: 除外エリアの状態変更時にフィールドの必須状態を再評価
- **使用方法**:
  ```javascript
  FormValidator.update();
  ```

### 3. check関数
- **概要**: 必須項目をすべて一括でバリデーション
- **機能**: 
  - 必須項目は強制的にバリデーション実行
  - 必須項目以外でも入力があるフィールドは対象のバリデーションを実行
- **使用方法**:
  ```javascript
  await FormValidator.check();
  ```

## 除外エリア機能の改善

### data-validate-hidden属性の対応強化
- フィールド個別での除外：`<input data-validate-hidden>`
- エリア全体での除外：`<div data-validate-hidden>`
- ネスト構造への対応：親要素の除外属性が子要素にも適用

### カウント計算の改善
- 除外エリア内のフィールドは必須カウントから除外
- 動的な除外エリアの表示/非表示に対応
- グループバリデーション（チェックボックス、ラジオボタン、セレクト）も除外対応

## 使用例

### 基本的な使用方法
```javascript
// 初期化
const formManager = FormValidator.init({
    count: true,
    disableSubmitUntilValid: true,
    debug: true
});

// 除外エリアの切り替え時
function toggleHiddenArea() {
    const hiddenArea = document.getElementById('hiddenArea');
    
    if (hiddenArea.hasAttribute('data-validate-hidden')) {
        hiddenArea.removeAttribute('data-validate-hidden');
    } else {
        hiddenArea.setAttribute('data-validate-hidden', '');
    }
    
    // カウントを再計算
    FormValidator.update();
}

// 全フィールドのバリデーション実行
function validateAll() {
    FormValidator.check();
}
```

### HTMLでの使用
```html
<!-- 通常の必須フィールド -->
<input type="text" name="name" data-validate="required">

<!-- 除外エリア -->
<div data-validate-hidden>
    <input type="text" name="company" data-validate="required">
    <!-- この必須フィールドはカウントから除外される -->
</div>

<!-- 個別除外フィールド -->
<input type="text" name="address" data-validate="required" data-validate-hidden>

<!-- カウント表示 -->
<span data-count_validate>0</span>
```

## 内部実装の改善

### FormManager.ts
- `manualUpdateCount()`: HTML互換の手動カウント更新関数
- `updateValidationCount()`: 内部用のカウント更新関数
- `validateAllFields()`: 拡張されたバリデーション実行関数
- `isFieldInHiddenArea()`: 除外エリア判定の公開API

### FieldStateManager.ts
- 除外エリア判定のコールバック対応
- 必須フィールドカウント時の除外エリア考慮
- 動的な除外状態変更への対応

### index.ts（FormValidator）
- `FormValidator.update()`: 静的メソッドとして追加
- `FormValidator.check()`: 静的メソッドとして追加
- `FormValidator.manualUpdateCount()`: 静的メソッドとして追加
- `window.manualUpdateCount`: グローバル関数として自動公開

## 互換性
- 既存のFormValidatorの使用方法は完全に維持
- 新しい機能はオプトイン形式で追加
- 除外エリア機能を使用しない場合は従来通りの動作
