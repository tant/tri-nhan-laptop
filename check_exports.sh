#\!/bin/bash

# Check for unused exports in currency.ts
echo "=== Checking currency.ts exports ==="
exports=("formatVND" "formatVNDCompact" "formatVNDDetailed" "formatVNDProfit" "formatPercentage" "parseVND" "formatCostBreakdown" "formatQuoteTotal" "formatNumberInput" "getProfitMarginColor" "getProfitAmountColor" "CostTerms")

for export in "${exports[@]}"; do
  count=$(rg -c "$export" src/ tests/ || echo "0")
  if [ "$count" -eq "0" ]; then
    echo "UNUSED: $export"
  else
    echo "USED: $export ($count occurrences)"
  fi
done
