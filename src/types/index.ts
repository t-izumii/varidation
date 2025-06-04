// ================================================================================================
// 型定義ファイル - バリデーションライブラリで使用される全ての型を定義
// ================================================================================================

// ---- バリデーション結果の型定義 ----
/**
 * バリデーション結果を表すインターフェース
 * 検証の成功/失敗とエラー情報を含む
 */
export interface ValidationResult {
  isValid: boolean;    // バリデーションが成功したかどうか
  errors: ValidationError[];  // エラーの配列（複数のエラーが発生する可能性）
}

/**
 * バリデーションエラーの詳細情報
 * 各エラーはルール名、メッセージ、検証した値を持つ
 */
export interface ValidationError {
  rule: string;        // 失敗したバリデーションルール名（例：'required', 'email'）
  message: string;     // ユーザーに表示するエラーメッセージ
  value?: any;         // 検証対象となった値（デバッグ用）
}

// ---- バリデーターオプションの型定義 ----
/**
 * バリデーターのオプション設定
 * 各バリデーターの動作をカスタマイズするための設定
 */
export interface ValidatorOptions {
    message?: string;                       // カスタムエラーメッセージ
    customMessages?: Record<string, string>; // カスタムメッセージの辞書
    customMessageKey?: string;              // カスタムメッセージキー（emesse1等）
    validationTypes?: string[];             // バリデーションタイプの配列
    fieldType?: string;                     // フィールドタイプ（name, email等）
    elementType?: string;                   // HTML要素タイプ（input, select等）
    textType?: string;                      // テキストバリデーションタイプ（hiragana, katakana等）
    allowHyphens?: boolean | null;          // ハイフンを許可するかどうか
    checkHalfWidth?: boolean;               // 半角チェックを行うかどうか
    checkConfirmation?: boolean;            // 確認フィールドとの一致チェック
    confirmationValue?: string;             // 確認対象の値
    mismatchMessage?: string;               // 不一致時のエラーメッセージ
    originalEmail?: string;                 // メール確認用の元のメールアドレス
    usePostalCodeJS?: boolean;              // 郵便番号JSライブラリを使用するか
    onValidPostalCode?: (value: string) => void;  // 郵便番号バリデーション成功時のコールバック
    validationOptions?: Record<string, any>; // バリデーターごとのオプション設定
    [key: string]: any;                     // その他の動的プロパティ
}

// ---- バリデーションルールの型定義 ----
/**
 * バリデーションルールの定義
 * ルール名、バリデーション関数、デフォルトメッセージから構成
 */
export type ValidationRule = {
  name: string;                           // ルール名（一意識別子）
  validator: (value: any, options?: ValidatorOptions) => boolean | Promise<boolean>;  // バリデーション関数
  defaultMessage: string;                 // デフォルトエラーメッセージ
};

// ---- フィールド状態の型定義 ----
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

// ---- フォームマネージャーオプションの型定義 ----
/**
 * FormManagerクラスの設定オプション
 * フォーム全体の動作を制御する設定
 */
export interface FormManagerOptions {
  // バリデーション関連の設定
  validation: {
    validateOnInput: boolean;            // 入力時にバリデーションを実行するか
    validateOnBlur: boolean;             // フォーカスアウト時にバリデーションを実行するか
    debounceDelay: number;               // デバウンス遅延時間（ミリ秒）
  };
  // エラー表示関連の設定
  errorDisplay: {
    showOnValidation: boolean;           // バリデーション時にエラーを表示するか
    clearOnFocus: boolean;               // フォーカス時にエラーをクリアするか
  };
  customMessages: Record<string, string>; // カスタムエラーメッセージの辞書
  // バリデーターごとのオプション設定
  validationOptions?: {
    tel?: {
      allowHyphens?: boolean;            // 電話番号でハイフンを許可するか
    };
    postalCode?: {
      allowHyphens?: boolean;            // 郵便番号でハイフンを許可するか
    };
    // 他のバリデーターオプションもここに追加可能
    [key: string]: any;
  };
  // イベントコールバック関数（オプション）
  onFieldValidated?: (data: FieldValidationEventData) => void;      // フィールドバリデーション完了時
  onFormValidated?: (data: FormValidationEventData) => void;        // フォームバリデーション完了時
  onCountUpdated?: (data: CountUpdateEventData) => void;            // カウント更新時
  onSubmitStateChanged?: (data: SubmitStateEventData) => void;      // 送信状態変更時
  disableSubmitUntilValid?: boolean;    // バリデーション完了まで送信ボタンを無効化するか
}

// ---- イベントデータの型定義 ----
/**
 * フィールドバリデーションイベントのデータ
 * 個別フィールドのバリデーション完了時に発火
 */
export interface FieldValidationEventData {
  fieldId: string;                                             // フィールドID
  field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;  // フィールド要素
  isValid: boolean;                                            // バリデーション結果
  errors: ValidationError[];                                   // エラー配列
}

/**
 * フォームバリデーションイベントのデータ
 * フォーム全体のバリデーション完了時に発火
 */
export interface FormValidationEventData {
  form: HTMLFormElement;                 // フォーム要素
  isValid: boolean;                      // フォーム全体のバリデーション結果
  fieldStates: Record<string, FieldState>; // 全フィールドの状態辞書
}

/**
 * カウント更新イベントのデータ
 * 必須フィールドの完了状況更新時に発火
 */
export interface CountUpdateEventData {
  valid: number;                         // バリデーション済みフィールド数
  total: number;                         // 必須フィールド総数
  isComplete: boolean;                   // 全ての必須フィールドが完了したかどうか
}

/**
 * 送信状態変更イベントのデータ
 * 送信ボタンの有効/無効状態変更時に発火
 */
export interface SubmitStateEventData {
  canSubmit: boolean;                    // 送信可能かどうか
  form: HTMLFormElement;                 // フォーム要素
}
