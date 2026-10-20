import L from "leaflet";

/** A coloured map pin with a Remix icon, drawn in the page (no image requests) */
export function pinIcon(color, icon = "ri-map-pin-2-fill") {
  return L.divIcon({
    className: "cn-map-pin",
    html: `<span class="cn-map-pin-body" style="--pin:${color}"><i class="${icon}" aria-hidden="true"></i></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
  });
}

/** Pin for the visitor's own location */
export const youAreHereIcon = L.divIcon({
  className: "cn-map-you",
  html: '<span class="cn-map-you-dot"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export const DHAKA = [23.7808, 90.4093];
