import React, { useState, useEffect } from "react";
import { customerService } from "@/shared/api/services";
import { useAuth } from "@/shared/contexts/AuthContext";
import { fetchCityStateFromPincode } from "@/shared/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PersonalInfoSection from "./profile/PersonalInfoSection";
import AddressSection from "./profile/AddressSection";
import ProfilePhotoSection from "./profile/ProfilePhotoSection";
import { loadProfileData, getProfileImageUrl } from "./profile/profileUtils";
import { useProfileModal } from "@/customer/contexts/ProfileModalContext";

import { type ProfileInput } from "@/shared/schemas/profile";

const defaultValues: ProfileInput = {
  full_name: "",
  door: "",
  street: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  dob: "",
  gender: "",
};

const ProfileUpdateForm: React.FC = () => {
  const { user, access } = useAuth();
  const { isOpen, close } = useProfileModal();
  const [preview, setPreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [initialValues, setInitialValues] = useState<ProfileInput | null>(null);
  const [formData, setFormData] = useState<ProfileInput>({ ...defaultValues });

  const setValue = (field: keyof ProfileInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!user?.customer_details?.id || !access) return;
    (async () => {
      try {
        const profileData = await loadProfileData(user.customer_details!.id);
        const vals: ProfileInput = {
          full_name: profileData.full_name,
          door: profileData.door,
          street: profileData.street,
          area: profileData.area,
          landmark: profileData.landmark,
          city: profileData.city,
          state: profileData.state,
          pincode: profileData.pincode,
          dob: profileData.dob,
          gender: profileData.gender,
        };
        setFormData(vals);
        setInitialValues(vals);
        const res = await customerService.customer.profile(user.customer_details!.id);
        const imgUrl = getProfileImageUrl(res.data.data, user);
        if (imgUrl) setPreview(imgUrl);
      } catch (err) {
        console.error("Failed to load customer:", err);
      }
    })();
  }, [user, access]);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setValue("pincode", value);
    setValue("city", "");
    setValue("state", "");
    if (value.length === 6) {
      fetchCityStateFromPincode(value).then((result) => {
        if (result) {
          setValue("city", result.city);
          setValue("state", result.state);
        }
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;
    if (name === "profile_image" && files?.[0]) {
      setProfileImage(files[0]);
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setValue(name as keyof ProfileInput, value);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = formData;

    const fullAddress = [
      data.door,
      data.street,
      data.area,
      data.landmark && `Landmark: ${data.landmark}`,
      `${data.city}, ${data.state} - ${data.pincode}`,
      "India",
    ]
      .filter(Boolean)
      .join(", ");

    const fd = new FormData();
    fd.append("full_name", data.full_name);
    fd.append("address", fullAddress);
    fd.append("dob", data.dob || "");
    fd.append("gender", data.gender || "");
    if (profileImage) fd.append("profile_image", profileImage);

    try {
      if (user?.customer_details?.id) {
        await customerService.customer.updateProfile(user.customer_details.id, fd);
      } else {
        await customerService.customer.createProfile(fd);
      }
      toast.success("Profile saved successfully!");
      close();
    } catch (err) {
      console.error(err);
      toast.error("Error saving profile. Please try again.");
    }
  };

  const resetForm = () => {
    if (!initialValues) return;
    setFormData({ ...initialValues });
    setProfileImage(null);
    if (user?.customer_details?.profile_image) {
      setPreview(user.customer_details.profile_image);
    } else {
      setPreview(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={close}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit}>
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h5 className="text-xl text-[var(--color-brand)] font-bold">Update Profile</h5>
            <button
              type="button"
              className="text-2xl leading-none text-gray-500 hover:text-gray-700"
              onClick={() => {
                resetForm();
                close();
              }}
            >
              &times;
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap -mx-2 gap-y-3">
              <PersonalInfoSection
                fullName={formData.full_name}
                dob={formData.dob || ""}
                gender={formData.gender || ""}
                onChange={handleChange}
              />
              <AddressSection
                door={formData.door}
                street={formData.street}
                area={formData.area}
                landmark={formData.landmark || ""}
                pincode={formData.pincode}
                city={formData.city || ""}
                state={formData.state || ""}
                onChange={handleChange}
                onPincodeChange={handlePincodeChange}
              />
              <ProfilePhotoSection
                preview={preview}
                loginMethod={user?.login_method}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-center gap-3 px-6 py-4 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                resetForm();
                close();
              }}
            >
              Close
            </Button>
            <Button variant="brand" type="submit">
              Update Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdateForm;
