"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FilterState = {
  ageRange: [number, number];
  onlineOnly: boolean;
  characterTypes: string[];
  popularity: string;
};

interface SidebarProps {
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
}

export function Sidebar({ filters, onFilterChange }: SidebarProps) {
  const [ageRange, setAgeRange] = useState<[number, number]>(
    filters?.ageRange || [18, 30],
  );
  const [onlineOnly, setOnlineOnly] = useState(filters?.onlineOnly || false);
  const [characterTypes, setCharacterTypes] = useState<string[]>(
    filters?.characterTypes || [],
  );
  const [popularity, setPopularity] = useState(filters?.popularity || "すべて");

  // フィルター変更時に親コンポーネントに通知
  const notifyFilterChange = (updatedFilters: Partial<FilterState>) => {
    if (onFilterChange) {
      onFilterChange({
        ageRange,
        onlineOnly,
        characterTypes,
        popularity,
        ...updatedFilters,
      });
    }
  };

  // 年齢範囲の変更
  const handleAgeRangeChange = (value: [number, number]) => {
    setAgeRange(value);
    notifyFilterChange({ ageRange: value });
  };

  // オンラインのみの変更
  const handleOnlineOnlyChange = (checked: boolean) => {
    setOnlineOnly(checked);
    notifyFilterChange({ onlineOnly: checked });
  };

  // キャラクタータイプの切り替え
  const toggleCharacterType = (type: string) => {
    let newTypes: string[];
    if (characterTypes.includes(type)) {
      newTypes = characterTypes.filter((t) => t !== type);
    } else {
      newTypes = [...characterTypes, type];
    }
    setCharacterTypes(newTypes);
    notifyFilterChange({ characterTypes: newTypes });
  };

  // 人気度の切り替え
  const handlePopularityChange = (value: string) => {
    setPopularity(value);
    notifyFilterChange({ popularity: value });
  };

  return (
    <aside className="w-full md:w-64 p-4 bg-[#111111] rounded-lg">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">フィルター</h3>
        </div>
        {/* 年齢範囲 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">年齢</h4>

          {/* スライダー */}
          <div className="pt-2 px-1">
            <Slider
              value={ageRange}
              min={18}
              max={60}
              step={1}
              onValueChange={(value) =>
                handleAgeRangeChange(value as [number, number])
              }
              className="[&_[role=slider]]:bg-pink-500 [&_[role=slider]]:border-pink-500 [&_[role=slider]]:ring-pink-200"
            />
          </div>

          {/* 現在の選択範囲を表示とカスタム入力 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">最小:</span>
                <input
                  type="number"
                  value={ageRange[0]}
                  onChange={(e) => {
                    const min = Math.max(18, Math.min(Number(e.target.value), ageRange[1]));
                    handleAgeRangeChange([min, ageRange[1]]);
                  }}
                  className="bg-gray-800 text-pink-400 rounded px-2 py-1 w-16 text-center text-sm border border-gray-700 focus:border-pink-500 focus:outline-none"
                  min={18}
                  max={60}
                />
                <span className="text-gray-400">歳</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">最大:</span>
                <input
                  type="number"
                  value={ageRange[1]}
                  onChange={(e) => {
                    const max = Math.min(60, Math.max(Number(e.target.value), ageRange[0]));
                    handleAgeRangeChange([ageRange[0], max]);
                  }}
                  className="bg-gray-800 text-pink-400 rounded px-2 py-1 w-16 text-center text-sm border border-gray-700 focus:border-pink-500 focus:outline-none"
                  min={18}
                  max={60}
                />
                <span className="text-gray-400">歳</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="bg-gray-800 rounded px-3 py-1 text-white flex items-center justify-center">
                <span className="text-pink-400 font-medium">{ageRange[0]}歳</span>
                <span className="mx-2 text-gray-400">〜</span>
                <span className="text-pink-400 font-medium">{ageRange[1]}歳</span>
              </div>
              <button
                onClick={() => handleAgeRangeChange([18, 30])}
                className="text-xs text-gray-400 hover:text-pink-400 transition-colors px-2 py-1 rounded hover:bg-gray-800"
              >
                リセット
              </button>
            </div>
          </div>
        </div>
        {/* キャラクタータイプ */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">タイプ</h4>
          <div className="flex flex-wrap gap-2">
            {["実写", "アニメ", "3D", "リアル調"].map((type) => (
              <Badge
                key={type}
                variant="outline"
                className={cn(
                  "cursor-pointer hover:bg-pink-500/10 transition-colors",
                  characterTypes.includes(type)
                    ? "bg-pink-500/20 text-pink-300 border-pink-500"
                    : "text-gray-400",
                )}
                onClick={() => toggleCharacterType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
        {/* 人気度 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">人気度</h4>
          <div className="flex flex-wrap gap-2">
            {["すべて", "人気", "新しい", "トレンド"].map((pop) => (
              <Badge
                key={pop}
                variant="outline"
                className={cn(
                  "cursor-pointer hover:bg-pink-500/10 transition-colors",
                  popularity === pop
                    ? "bg-pink-500/20 text-pink-300 border-pink-500"
                    : "text-gray-400",
                )}
                onClick={() => handlePopularityChange(pop)}
              >
                {pop}
              </Badge>
            ))}
          </div>
        </div>
        {/* オンライン状態 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="online-only"
              className="text-sm font-medium text-gray-300"
            >
              オンライン中のみ表示
            </Label>
            <Switch
              id="online-only"
              checked={onlineOnly}
              onCheckedChange={handleOnlineOnlyChange}
              className="data-[state=checked]:bg-pink-500"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
