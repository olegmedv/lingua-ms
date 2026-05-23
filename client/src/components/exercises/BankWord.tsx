interface WordItem {
  id: string;
  label: string;
}

export default function BankWord({ item, onClick }: { item: WordItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border-2 border-gray-300 rounded-xl px-4 py-2 text-lg font-semibold select-none hover:border-brand hover:bg-brand/5 transition-colors"
    >
      {item.label}
    </button>
  );
}
