type GenerateButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export default function GenerateButton({ onClick, disabled = false }: GenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
    >
      {disabled ? "Generating..." : "Generate Flowchart"}
    </button>
  );
}
