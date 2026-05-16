/**
 * Shared column widths for the stats detail table so the summary rows and nested breakdown
 * use the same layout (table-fixed + same col %).
 */
export function StatsTableColgroup() {
  return (
    <colgroup>
      {/* Tháng | Thu nhập | Dự chi | Thực chi | Dư kế hoạch | Dư thực — sum 100% */}
      <col style={{ width: '15%' }} />
      <col style={{ width: '14%' }} />
      <col style={{ width: '16%' }} />
      <col style={{ width: '16%' }} />
      <col style={{ width: '20%' }} />
      <col style={{ width: '19%' }} />
    </colgroup>
  )
}
