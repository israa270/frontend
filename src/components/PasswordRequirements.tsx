type PasswordRequirementsProps = {
  password: string;
};

function ruleLengthOk(p: string): boolean {
  return p.length >= 8 && p.length <= 64;
}

function ruleClassesOk(p: string): boolean {
  return (
    /[A-Z]/.test(p) &&
    /[a-z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[!@#$%^&*]/.test(p) &&
    !/\s/.test(p)
  );
}

/** Live checklist aligned with validation rules (length separate from charset rules). */
export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const lenOk = ruleLengthOk(password);
  const classesOk = ruleClassesOk(password);

  return (
    <div
      className="rounded-lg bg-surface-low px-4 py-3 text-left text-body-md text-slate-medium"
      aria-live="polite"
    >
      <p className="mb-2 text-label-sm text-slate-dark">
        Password requirements
      </p>
      <ul className="m-0 list-none space-y-2 p-0">
        <li className="flex items-start gap-2">
          <span
            className={`icon-material shrink-0 text-lg ${lenOk ? "text-primary" : "text-slate-light"}`}
            aria-hidden
          >
            {lenOk ? "check_circle" : "radio_button_unchecked"}
          </span>
          <span>At least 8 characters (max 64), no spaces</span>
        </li>
        <li className="flex items-start gap-2">
          <span
            className={`icon-material shrink-0 text-lg ${classesOk ? "text-primary" : "text-slate-light"}`}
            aria-hidden
          >
            {classesOk ? "check_circle" : "radio_button_unchecked"}
          </span>
          <span>
            {"One uppercase, lowercase, digit, and special (!@#$%^&*)"}
          </span>
        </li>
      </ul>
    </div>
  );
}
