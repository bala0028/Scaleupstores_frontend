import { toast } from "sonner";

export interface ParsedAddress {
  door: string;
  street: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

/** Parse a comma-separated address string into structured fields */
export const parseAddress = (address = ""): ParsedAddress => {
  const parts = address.split(",").map((p) => p.trim());

  let city = "";
  let state = "";
  let pincode = "";

  parts.forEach((p) => {
    const match = p.match(/(.+)\s*-\s*(\d{6})/);
    if (match) {
      state = match[1].trim();
      pincode = match[2];
    }
  });

  const pinIndex = parts.findIndex((p) => p.includes(pincode));
  if (pinIndex > 0) city = parts[pinIndex - 1];

  return {
    door: parts[0] || "",
    street: parts[1] || "",
    area: parts[2] || "",
    landmark:
      parts
        .find((p) => p.toLowerCase().startsWith("landmark"))
        ?.replace("Landmark:", "")
        .trim() || "",
    city,
    state,
    pincode,
  };
};

/** Fetch city/state from Indian postal pincode API */
export const fetchCityStateFromPincode = async (
  pincode: string
): Promise<{ city: string; state: string } | null> => {
  if (!/^\d{6}$/.test(pincode)) return null;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();

    if (data[0]?.Status === "Success") {
      const po = data[0].PostOffice[0];
      return { city: po.District, state: po.State };
    }
    toast.error("Invalid Pincode");
    return null;
  } catch {
    toast.error("Pincode service unavailable");
    return null;
  }
};
