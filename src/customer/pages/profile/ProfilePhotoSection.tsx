import React from "react";

interface ProfilePhotoSectionProps {
  preview: string | null;
  loginMethod?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({
  preview,
  loginMethod,
  onChange,
}) => {
  return (
    <div className="w-full px-2">
      <label className="block text-sm font-medium mb-1 text-[var(--color-brand)] font-semibold">
        Profile Photo
      </label>

      {loginMethod !== "google" && (
        <input
          type="file"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] rounded-[var(--radius-card)] border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-black focus:border-[var(--color-brand)] focus:bg-white focus:outline-none focus:shadow-[0_0_5px_rgba(122,86,58,0.4)] transition-colors"
          name="profile_image"
          onChange={onChange}
        />
      )}

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="mt-2 rounded-[var(--radius-card)] border border-[var(--color-brand-border)] object-cover w-[120px] h-[120px]"
        />
      )}
    </div>
  );
};

export default ProfilePhotoSection;
