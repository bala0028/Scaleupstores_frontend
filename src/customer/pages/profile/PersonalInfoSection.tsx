import React from "react";

interface PersonalInfoSectionProps {
  fullName: string;
  dob: string;
  gender: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  fullName,
  dob,
  gender,
  onChange,
}) => {
  return (
    <>
      <div className="w-full md:w-1/2 px-2">
        <div className="form-floating">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] rounded-[var(--radius-card)] border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-black focus:border-[var(--color-brand)] focus:bg-white focus:outline-none focus:shadow-[0_0_5px_rgba(122,86,58,0.4)] transition-colors"
            id="fullName"
            name="full_name"
            value={fullName}
            onChange={onChange}
            placeholder="Full Name"
          />
          <label htmlFor="fullName" className="text-black font-semibold">
            Full Name
          </label>
        </div>
      </div>

      <div className="w-full md:w-1/2 px-2">
        <div className="form-floating">
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] rounded-[var(--radius-card)] border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-black focus:border-[var(--color-brand)] focus:bg-white focus:outline-none focus:shadow-[0_0_5px_rgba(122,86,58,0.4)] transition-colors"
            id="dob"
            name="dob"
            value={dob}
            onChange={onChange}
            placeholder="Date of Birth"
          />
          <label htmlFor="dob" className="text-black font-semibold">
            Date of Birth
          </label>
        </div>
      </div>

      <div className="w-full md:w-1/2 px-2">
        <div className="form-floating">
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 rounded-[var(--radius-card)] border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-black focus:border-[var(--color-brand)] focus:bg-white focus:outline-none focus:shadow-[0_0_5px_rgba(122,86,58,0.4)] transition-colors"
            id="gender"
            name="gender"
            value={gender}
            onChange={onChange}
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <label htmlFor="gender" className="text-black font-semibold">
            Gender
          </label>
        </div>
      </div>
    </>
  );
};

export default PersonalInfoSection;
