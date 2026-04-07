"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterType, formatDateForInput } from "@/lib/dateUtils";
import { X } from "lucide-react";

interface DateRangeFilterProps {
  selectedFilter: FilterType;
  customStartDate?: string;
  customEndDate?: string;
  onFilterChange: (filterType: FilterType, customStart?: string, customEnd?: string) => void;
}

export function DateRangeFilter({ selectedFilter, customStartDate, customEndDate, onFilterChange }: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(selectedFilter === "custom");
  const [tempStart, setTempStart] = useState(customStartDate || "");
  const [tempEnd, setTempEnd] = useState(customEndDate || "");

  const handleCustomSubmit = () => {
    if (tempStart && tempEnd) {
      onFilterChange("custom", tempStart, tempEnd);
      setShowCustom(false);
    }
  };

  const handleQuickFilter = (filter: FilterType) => {
    onFilterChange(filter);
    setShowCustom(false);
  };

  return (
  <Card className="border-0 shadow-md">
  <CardContent className="py-3 space-y-4">
    
    {/* Top Row */}
    <div className="flex items-center justify-between">
      <p className="font-medium">Filter by Date Range</p>

      <div className="flex flex-wrap gap-2">
        <Button
        size="sm"
          onClick={() => handleQuickFilter("week")}
          variant={selectedFilter === "week" ? "default" : "outline"}
          className={selectedFilter === "week" ? "bg-blue-600" : ""}
        >
          Past 1 Week
        </Button>

        <Button
            size="sm"
          onClick={() => handleQuickFilter("month")}
          variant={selectedFilter === "month" ? "default" : "outline"}
          className={selectedFilter === "month" ? "bg-blue-600" : ""}
        >
          Past 1 Month
        </Button>

        <Button
            size="sm"
          onClick={() => handleQuickFilter("all")}
          variant={selectedFilter === "all" ? "default" : "outline"}
          className={selectedFilter === "all" ? "bg-blue-600" : ""}
        >
          All Time
        </Button>

        <Button
            size="sm"
          onClick={() => setShowCustom(!showCustom)}
          variant={selectedFilter === "custom" ? "default" : "outline"}
          className={selectedFilter === "custom" ? "bg-blue-600" : ""}
        >
          Custom Range
        </Button>
      </div>
    </div>

    {/* Custom Date Range */}
    {showCustom && (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={tempStart}
              onChange={(e) => setTempStart(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={tempEnd}
              onChange={(e) => setTempEnd(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCustomSubmit}
            className="bg-green-600 hover:bg-green-700"
            disabled={!tempStart || !tempEnd}
          >
            Apply
          </Button>

          <Button
            onClick={() => {
              setShowCustom(false);
              setTempStart("");
              setTempEnd("");
            }}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    )}

    {/* Selected Range */}
    {selectedFilter === "custom" && customStartDate && customEndDate && (
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
        Selected range:{" "}
        <span className="font-semibold">{customStartDate}</span> to{" "}
        <span className="font-semibold">{customEndDate}</span>
      </div>
    )}

  </CardContent>
</Card>
  );
}
