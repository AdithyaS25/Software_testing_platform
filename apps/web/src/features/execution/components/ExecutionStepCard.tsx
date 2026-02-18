import { useState } from "react";

interface Props {
  stepNumber: number;
  action: string;
  expectedResult: string;
  onUpdate: (data: {
    status?: string;
    actualResult?: string;
    notes?: string;
  }) => void;
}

export const ExecutionStepCard = ({
  stepNumber,
  action,
  expectedResult,
  onUpdate,
}: Props) => {
  const [status, setStatus] = useState("");
  const [actualResult, setActualResult] = useState("");
  const [notes, setNotes] = useState("");

  const handleChange = () => {
    onUpdate({
      status,
      actualResult,
      notes,
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="font-semibold">Step {stepNumber}</div>

      <div>
        <p className="text-sm text-gray-500">Action</p>
        <p>{action}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Expected Result</p>
        <p>{expectedResult}</p>
      </div>

      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          handleChange();
        }}
        className="border rounded p-2"
      >
        <option value="">Select Status</option>
        <option value="PASS">Pass</option>
        <option value="FAIL">Fail</option>
        <option value="BLOCKED">Blocked</option>
        <option value="SKIPPED">Skipped</option>
      </select>

      <textarea
        value={actualResult}
        onChange={(e) => {
          setActualResult(e.target.value);
          handleChange();
        }}
        placeholder="Actual Result"
        className="w-full border rounded p-2"
      />

      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          handleChange();
        }}
        placeholder="Notes"
        className="w-full border rounded p-2"
      />
    </div>
  );
};
