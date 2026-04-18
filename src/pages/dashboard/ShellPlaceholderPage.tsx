type ShellPlaceholderPageProps = {
  title: string;
};

export function ShellPlaceholderPage({ title }: ShellPlaceholderPageProps) {
  return (
    <>
      <h1 className="text-headline-lg text-slate-dark">{title}</h1>
      <p className="mt-2 text-body-md text-slate-medium">
        This section will be available soon.
      </p>
    </>
  );
}
