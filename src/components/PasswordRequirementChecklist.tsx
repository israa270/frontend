type PasswordRequirementChecklistProps = {
  password: string;
};

/** Two-column grid order aligned with Tasks Management reset-password Figma. */
export function PasswordRequirementChecklist({
  password,
}: PasswordRequirementChecklistProps) {
  const p = password;
  const items: { label: string; ok: boolean }[] = [
    {
      label: "8-64 characters",
      ok: p.length >= 8 && p.length <= 64 && !/\s/.test(p),
    },
    { label: "Uppercase letter", ok: /[A-Z]/.test(p) },
    { label: "Lowercase letter", ok: /[a-z]/.test(p) },
    { label: "One digit", ok: /[0-9]/.test(p) },
    { label: "Special character", ok: /[!@#$%^&*]/.test(p) },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
      {items.map(({ label, ok }) => (
        <div key={label} className="flex items-start gap-2 text-sm">
          <span
            className={`icon-material shrink-0 text-lg ${ok ? "text-green-600" : "text-slate-light"}`}
            aria-hidden
          >
            {ok ? "check_circle" : "radio_button_unchecked"}
          </span>
          <span
            className={ok ? "font-medium text-green-800" : "text-slate-medium"}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
