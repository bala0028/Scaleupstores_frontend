import { customerService } from "@/shared/api/services";
import { parseAddress } from "@/shared/utils";
import { Customer, DetailResponse } from "@/shared/api/services/types";

export interface FormData {
  full_name: string;
  door: string;
  street: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  dob: string;
  gender: string;
  profile_image: File | null;
}

export const loadProfileData = async (customerId: number): Promise<FormData> => {
  const res = await customerService.customer.profile(customerId);
  const data = res.data as DetailResponse<Customer>;
  const address = data.data.address || "";
  const parsed = parseAddress(address);

  return {
    full_name: data.data.full_name || "",
    ...parsed,
    dob: data.data.dob || "",
    gender: data.data.gender || "",
    profile_image: null,
  };
};

export const getProfileImageUrl = (data: any, user: any): string | null => {
  if (data?.profile_image) {
    return data.profile_image.startsWith("http") ? data.profile_image : `${data.profile_image}`;
  }
  if (user?.login_method === "google" && user.customer_details?.profile_image) {
    return user.customer_details.profile_image;
  }
  if (user?.profile_image) {
    return user.profile_image;
  }
  return null;
};
