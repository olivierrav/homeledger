// FILENAME: src/components/SelectIcon.jsx
import React, { useState, useMemo } from "react";
import { Button, Input, Modal } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import MaterialIcon from "./MaterialIcon";

// Curated list of commonly used icons for a personal finance app
// Users can also type any valid Material Symbols key in the search
const ICON_LIST = [
  // Finance & Money
  "payments", "credit_card", "account_balance", "account_balance_wallet", "savings",
  "currency_exchange", "attach_money", "money", "price_check", "receipt", "receipt_long",
  "request_quote", "paid", "toll", "point_of_sale", "atm", "euro", "euro_symbol",

  // Shopping & Commerce
  "shopping_cart", "shopping_bag", "storefront", "store", "local_mall", "sell",
  "shopping_basket", "add_shopping_cart", "remove_shopping_cart", "loyalty",

  // Food & Drink
  "restaurant", "fastfood", "local_cafe", "local_bar", "local_dining", "lunch_dining",
  "dinner_dining", "bakery_dining", "brunch_dining", "liquor", "coffee", "emoji_food_beverage",
  "local_pizza", "icecream", "cake", "kitchen",

  // Transport
  "directions_car", "local_gas_station", "directions_bus", "train", "flight", "subway",
  "tram", "directions_bike", "two_wheeler", "local_taxi", "airport_shuttle", "car_rental",
  "ev_station", "local_parking", "garage",

  // Home & Living
  "home", "house", "cottage", "apartment", "villa", "bed", "chair", "weekend",
  "light", "electrical_services", "water_drop", "local_fire_department", "thermostat",
  "cleaning_services", "roofing", "plumbing", "handyman",

  // Health & Wellness
  "local_hospital", "medical_services", "medication", "vaccines", "health_and_safety",
  "fitness_center", "spa", "self_improvement", "sports_gymnastics", "pool",
  "sports", "sports_soccer", "sports_tennis",

  // Entertainment & Leisure
  "movie", "theaters", "music_note", "headphones", "videogame_asset", "sports_esports",
  "casino", "attractions", "park", "beach_access", "hiking", "camping",

  // Education & Work
  "school", "menu_book", "auto_stories", "work", "business_center", "badge",
  "computer", "laptop", "phone_iphone", "devices", "print",

  // Communication & Social
  "call", "email", "chat", "forum", "groups", "person", "family_restroom",
  "child_care", "pets", "cruelty_free",

  // Travel & Places
  "flight_takeoff", "hotel", "luggage", "map", "place", "explore", "public",
  "travel_explore", "tour", "photo_camera",

  // Services & Subscriptions
  "subscriptions", "card_membership", "wifi", "cell_tower", "router",
  "live_tv", "radio", "newspaper", "feed",

  // Gifts & Events
  "redeem", "card_giftcard", "celebration", "cake", "event",

  // Insurance & Legal
  "gavel", "policy", "security", "verified_user", "shield",

  // Other useful icons
  "category", "label", "bookmark", "star", "favorite", "thumb_up",
  "check_circle", "pending", "schedule", "calendar_month", "today",
  "trending_up", "trending_down", "analytics", "insights", "bar_chart",
  "pie_chart", "show_chart", "leaderboard",
  "settings", "tune", "build", "construction", "handshake",
  "volunteer_activism", "eco", "recycling", "nature", "forest",
  "more_horiz", "help", "info", "warning", "error",
];

// Remove duplicates
const UNIQUE_ICONS = [...new Set(ICON_LIST)];

function SelectIcon({ value, onChange, size = 24, color = "inherit", disabled = false }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return UNIQUE_ICONS;
    const searchLower = search.toLowerCase().replace(/[_\s-]/g, "");
    return UNIQUE_ICONS.filter((icon) =>
      icon.toLowerCase().replace(/_/g, "").includes(searchLower)
    );
  }, [search]);

  const handleSelect = (icon) => {
    onChange?.(icon);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const handleCustomIcon = () => {
    if (search.trim()) {
      onChange?.(search.trim());
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <>
      <Button
        type="text"
        disabled={disabled}
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 8px",
          minWidth: 40,
          height: 32,
        }}
      >
        {value ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <MaterialIcon icon={value} size={size} color={color} />
            <CloseOutlined
              style={{ fontSize: 12, color: "#999" }}
              onClick={handleClear}
            />
          </span>
        ) : (
          <span style={{ color: "#999", fontSize: 12 }}>
            {t("selectIcon.placeholder")}
          </span>
        )}
      </Button>

      <Modal
        title={t("selectIcon.title")}
        open={open}
        onCancel={() => {
          setOpen(false);
          setSearch("");
        }}
        footer={null}
        width={600}
        styles={{ body: { padding: "16px 24px" } }}
      >
        <Input
          placeholder={t("selectIcon.searchPlaceholder")}
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          autoFocus
          style={{ marginBottom: 16 }}
          onPressEnter={handleCustomIcon}
        />

        {search.trim() && filteredIcons.length === 0 && (
          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <Button type="link" onClick={handleCustomIcon}>
              {t("selectIcon.useCustomIcon", { icon: search.trim() })}
            </Button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 8,
            maxHeight: 320,
            overflowY: "auto",
            overflowX: "hidden",
            padding: 4,
          }}
        >
          {filteredIcons.map((icon) => (
            <div
              key={icon}
              onClick={() => handleSelect(icon)}
              title={icon}
              style={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 6,
                backgroundColor: value === icon ? "#1890ff" : "transparent",
                border: value === icon ? "none" : "1px solid #d9d9d9",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (value !== icon) {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }
              }}
              onMouseLeave={(e) => {
                if (value !== icon) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <MaterialIcon
                icon={icon}
                size={24}
                color={value === icon ? "#fff" : "#666"}
              />
            </div>
          ))}
        </div>

        {value && (
          <div style={{ marginTop: 16, textAlign: "center", color: "#666", fontSize: 12 }}>
            {t("selectIcon.selected")}: <code>{value}</code>
          </div>
        )}
      </Modal>
    </>
  );
}

export default SelectIcon;
