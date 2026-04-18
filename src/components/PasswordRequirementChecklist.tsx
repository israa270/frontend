type PasswordRequirementChecklistProps = {
  password: string;
};

/** Per-rule checklist (e.g. reset password / Figma security grid). */
export function PasswordRequirementChecklist({
  password,
}: PasswordRequirementChecklistProps) {
  const p = password;
  const items: { label: string; ok: boolean }[] = [
    {
      label: "8–64 characters, no spaces",
      ok: p.length >= 8 && p.length <= 64 && !/\s/.test(p),
    },
    { label: "Lowercase letter", ok: /[a-z]/.test(p) },
    { label: "Special character (!@#$%^&*)", ok: /[!@#$%^&*]/.test(p) },
    { label: "Uppercase letter", ok: /[A-Z]/.test(p) },
    { label: "One digit", ok: /[0-9]/.test(p) },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
      {items.map(({ label, ok }) => (
        <div
          key={label}
          className="flex items-start gap-2 text-sm text-slate-medium"
        >
          <span
            className={`icon-material shrink-0 text-lg ${ok ? "text-green-600" : "text-slate-light"}`}
            aria-hidden
          >
            {ok ? "check_circle" : "radio_button_unchecked"}
          </span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
