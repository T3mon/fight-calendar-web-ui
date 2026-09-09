import { useEffect, useRef, useState } from "react";
import "./PromotionSidebar.css";
import { colorForGroup, colorForPromotion, groupForPromotion, GROUP_ORDER } from "./promotionColors";
import type { Promotion } from "./types";

interface PromotionSidebarProps {
  promotions: Promotion[];
  selectedCodes: Set<string>;
  onToggle: (code: string) => void;
  onSetMany: (codes: string[], selected: boolean) => void;
}

interface TriStateCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  ariaLabel: string;
  accentColor: string;
}

function TriStateCheckbox({ checked, indeterminate, onChange, ariaLabel, accentColor }: TriStateCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      className="promotion-checkbox"
      style={{ "--accent": accentColor } as React.CSSProperties}
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
    />
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={"promotion-chevron" + (expanded ? " promotion-chevron-expanded" : "")}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
    >
      <path d="M2 3.2L5 6.2L8 3.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PromotionSidebar({ promotions, selectedCodes, onToggle, onSetMany }: PromotionSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(GROUP_ORDER));

  const byGroup = new Map<string, Promotion[]>();
  const standalone: Promotion[] = [];
  for (const promotion of promotions) {
    const group = groupForPromotion(promotion.code);
    if (group) {
      const existing = byGroup.get(group);
      if (existing) {
        existing.push(promotion);
      } else {
        byGroup.set(group, [promotion]);
      }
    } else {
      standalone.push(promotion);
    }
  }

  function toggleExpanded(group: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }

  const allCodes = promotions.map((p) => p.code);
  const allSelectedCount = allCodes.filter((c) => selectedCodes.has(c)).length;
  const allSelected = allSelectedCount === allCodes.length && allCodes.length > 0;
  const noneSelected = allSelectedCount === 0;

  return (
    <div className="promotion-sidebar">
      <div className="promotion-sidebar-title-row">
        <h2 className="promotion-sidebar-title">Promotions</h2>
      </div>

      <label className="promotion-row promotion-select-all">
        <TriStateCheckbox
          checked={allSelected}
          indeterminate={!allSelected && !noneSelected}
          onChange={() => onSetMany(allCodes, !allSelected)}
          ariaLabel="Select or deselect all promotions"
          accentColor="#e8e8e8"
        />
        <span className="promotion-label-text">{allSelected ? "Deselect all" : "Select all"}</span>
      </label>

      {GROUP_ORDER.filter((group) => byGroup.has(group)).map((group) => {
        const members = byGroup.get(group)!;
        const codes = members.map((m) => m.code);
        const selectedCount = codes.filter((c) => selectedCodes.has(c)).length;
        const groupAllSelected = selectedCount === codes.length;
        const groupNoneSelected = selectedCount === 0;
        const expanded = expandedGroups.has(group);
        const groupColor = colorForGroup(group);

        return (
          <div className="promotion-group" key={group}>
            <div className="promotion-group-header">
              <button
                type="button"
                className="promotion-group-caret"
                onClick={() => toggleExpanded(group)}
                aria-label={expanded ? `Collapse ${group}` : `Expand ${group}`}
              >
                <ChevronIcon expanded={expanded} />
              </button>
              <TriStateCheckbox
                checked={groupAllSelected}
                indeterminate={!groupAllSelected && !groupNoneSelected}
                onChange={() => onSetMany(codes, !groupAllSelected)}
                ariaLabel={`Select or deselect all ${group} promotions`}
                accentColor={groupColor}
              />
              <span className="promotion-dot" style={{ backgroundColor: groupColor }} />
              <span className="promotion-group-label">{group}</span>
            </div>

            <div className={"promotion-group-children-wrapper" + (expanded ? " expanded" : "")}>
              <div className="promotion-group-children">
                {members.map((promotion) => (
                  <label className="promotion-row promotion-row-indented" key={promotion.id}>
                    <input
                      type="checkbox"
                      className="promotion-checkbox"
                      style={{ "--accent": colorForPromotion(promotion.code) } as React.CSSProperties}
                      checked={selectedCodes.has(promotion.code)}
                      onChange={() => onToggle(promotion.code)}
                    />
                    <span className="promotion-dot" style={{ backgroundColor: colorForPromotion(promotion.code) }} />
                    <span className="promotion-label-text">{promotion.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {standalone.length > 0 && (
        <div className="promotion-group">
          {byGroup.size > 0 && <div className="promotion-standalone-label">Other</div>}
          {standalone.map((promotion) => (
            <label className="promotion-row" key={promotion.id}>
              <input
                type="checkbox"
                className="promotion-checkbox"
                style={{ "--accent": colorForPromotion(promotion.code) } as React.CSSProperties}
                checked={selectedCodes.has(promotion.code)}
                onChange={() => onToggle(promotion.code)}
              />
              <span className="promotion-dot" style={{ backgroundColor: colorForPromotion(promotion.code) }} />
              <span className="promotion-label-text">{promotion.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
