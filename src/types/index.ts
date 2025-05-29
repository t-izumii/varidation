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
    customMessages?: Record<string, string>;
    customMessageKey?: string;
    validationTypes?: string[];
    fieldType?: string;
    elementType?: string;
    textType?: string;
    allowHyphens?: boolean | null;
    checkHalfWidth?: boolean;
    checkConfirmation?: boolean;
    confirmationValue?: string;
    mismatchMessage?: string;
    originalEmail?: string;
    usePostalCodeJS?: boolean;
    onValidPostalCode?: (value: string) => void;
    [key: string]: any;
}

export type ValidationRule = {
  name: string;
  validator: (value: any, options?: ValidatorOptions) => boolean | Promise<boolean>;
  defaultMessage: string;
};

export interface FieldState {
  value: string;
  isValid: boolean;
  errors: ValidationError[];
  isDirty: boolean;
  isTouched?: boolean;
}

export interface FormManagerOptions {
  validation: {
    validateOnInput: boolean;
    validateOnBlur: boolean;
    debounceDelay: number;
  };
  errorDisplay: {
    showOnValidation: boolean;
    clearOnFocus: boolean;
    animationDuration: number;
  };
  customMessages: Record<string, string>;
  onFieldValidated?: (data: FieldValidationEventData) => void;
  onFormValidated?: (data: FormValidationEventData) => void;
  onCountUpdated?: (data: CountUpdateEventData) => void;
  onSubmitStateChanged?: (data: SubmitStateEventData) => void;
}

export interface FieldValidationEventData {
  fieldId: string;
  field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  isValid: boolean;
  errors: ValidationError[];
}

export interface FormValidationEventData {
  form: HTMLFormElement;
  isValid: boolean;
  fieldStates: Record<string, FieldState>;
}

export interface CountUpdateEventData {
  valid: number;
  total: number;
  isComplete: boolean;
}

export interface SubmitStateEventData {
  canSubmit: boolean;
  form: HTMLFormElement;
}