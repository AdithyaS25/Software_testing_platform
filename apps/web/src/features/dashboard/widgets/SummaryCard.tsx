export const SummaryCard = ({
  title,
  value,
}: {
  title: string;
  value: number;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-2xl font-bold mt-2 text-gray-800">
      {value}
    </h2>
  </div>
);
