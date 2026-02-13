interface Props {
  stepNumber: number
  action: string
  expectedResult: string
}

export const ExecutionStepCard = ({
  stepNumber,
  action,
  expectedResult,
}: Props) => {
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

      <select className="border rounded p-2">
        <option value="">Select Status</option>
        <option value="Pass">Pass</option>
        <option value="Fail">Fail</option>
        <option value="Blocked">Blocked</option>
        <option value="Skipped">Skipped</option>
      </select>

      <textarea
        placeholder="Actual Result"
        className="w-full border rounded p-2"
      />

      <textarea
        placeholder="Notes"
        className="w-full border rounded p-2"
      />
    </div>
  )
}
