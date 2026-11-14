export interface BedConfiguration {
  id: string;
  name: string; // e.g. "Twin Sharing", "Single Room"
  price: number; // e.g. 8200
  period: string; // e.g. "/month"
  availableBeds: number; // e.g. 2, 1, 0
  statusLabel?: string; // e.g. "2 beds left", "Only 1 room left", "Sold out"
  isAvailable: boolean;
}

export interface ProximityItem {
  landmark: string; // e.g. "GEHU", "GEU Main"
  distance: string; // e.g. "450m", "1.2 km"
  time: string; // e.g. "5 mins walking", "3 mins scooty / 12m walk"
  iconType: "education" | "college" | "transit" | "general";
  travelMode: "walking" | "scooter" | "bus";
}

export interface AmenityItem {
  id: string;
  title: string; // e.g. "300 Mbps", "3x Meals", "Attached"
  subtitle: string; // e.g. "Wi-Fi", "+ Tea Snack", "Geyser Bath"
  iconType: "wifi" | "meals" | "bath" | "power" | "water" | "laundry" | "security" | "gym";
}

export interface OwnerContact {
  name: string;
  whatsappNumber: string; // with country code, e.g. "919876543210"
  role: string; // e.g. "Property Manager", "Owner"
}

export interface Listing {
  id: string;
  title: string; // e.g. "Stanza Living – Cambridge House"
  isVerified: boolean;
  residenceType: "Co-ed Residence" | "Boys Residence" | "Girls Residence";
  wingsInfo: string; // e.g. "Boys & Girls Wings"
  rating: {
    score: number; // e.g. 4.8
    reviewCount: number; // e.g. 124
  };
  address: {
    line: string; // e.g. "Lane 4, Subhash Nagar, Clement Town, Dehradun, Uttarakhand - 248002"
    city: string;
    state: string;
    pincode: string;
  };
  proximity: ProximityItem[];
  images: string[];
  bedConfigurations: BedConfiguration[];
  totalBedsLeft: number; // if 0, marks as Sold Out
  availabilitySummary: string; // e.g. "Both Single & Twin Available" or "Sold Out"
  amenities: AmenityItem[];
  pricingSummary: {
    minPrice: number; // e.g. 8200
    maxPrice?: number; // e.g. 12500
    period: string; // e.g. "/mo"
    inclusionsNote: string; // e.g. "Electricity & 3 Daily Meals Included"
  };
  ownerContact: OwnerContact;
}
