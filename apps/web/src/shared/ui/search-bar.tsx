export function SearchBar({
  action,
  name = "name",
  defaultValue,
  placeholder,
  ariaLabel,
  submitLabel,
}: {
  action: string;
  name?: string;
  defaultValue?: string;
  placeholder: string;
  ariaLabel: string;
  submitLabel: string;
}) {
  return (
    <form className="search-shell" action={action}>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="min-w-0 flex-1 border-0 bg-transparent px-4 py-2.5 text-[0.98rem] outline-none placeholder:text-text-muted"
      />
      <button className="btn btn-primary max-md:w-full" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
