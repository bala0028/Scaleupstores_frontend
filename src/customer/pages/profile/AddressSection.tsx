import React from "react";

interface AddressSectionProps {
  door: string;
  street: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPincodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  door,
  street,
  area,
  landmark,
  pincode,
  city,
  state,
  onChange,
  onPincodeChange,
}) => {
  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] rounded-[var(--radius-card)] border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-black focus:border-[var(--color-brand)] focus:bg-white focus:outline-none focus:shadow-[0_0_5px_rgba(122,86,58,0.4)] transition-colors";
  const labelClass = "text-black font-semibold";

  return (
    <>
      <div className="w-full md:w-1/2 px-2">
        <div className="form-floating">
          <input
            type="text"
            className={inputClass}
            id="doorNo"
            name="door"
            maxLength={20}
            value={door}
            onChange={onChange}
            placeholder="House / Flat / Door No"
          />
          <label htmlFor="doorNo" className={labelClass}>
            House / Flat / Door No
          </label>
        </div>
      </div>

      <div className="w-full md:w-1/2 px-2">
        <div className="form-floating">
          <input
            type="text"
            className={inputClass}
            id="street"
            name="street"
            maxLength={80}
            value={street}
            onChange={onChange}
            placeholder="Street / Road Name"
          />
          <label htmlFor="street" className={labelClass}>
            Street / Road Name
          </label>
        </div>
      </div>

      <div className="w-full md:w-1/2 px-2">
        <div className="form-floating">
          <input
            type="text"
            className={inputClass}
            id="area"
            name="area"
            maxLength={80}
            value={area}
            onChange={onChange}
            placeholder="Area / Locality"
          />
          <label htmlFor="area" className={labelClass}>
            Area / Locality
          </label>
        </div>
      </div>

      <div className="w-full md:w-1/2 px-2">
        <div className="form-floating">
          <input
            type="text"
            className={inputClass}
            id="landmark"
            name="landmark"
            maxLength={80}
            value={landmark}
            onChange={onChange}
            placeholder="Landmark"
          />
          <label htmlFor="landmark" className={labelClass}>
            Landmark
          </label>
        </div>
      </div>

      <div className="w-full md:w-1/2 px-2">
        <div className="form-floating">
          <input
            type="text"
            className={inputClass}
            id="pincode"
            name="pincode"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]{6}"
            value={pincode}
            onChange={onPincodeChange}
            placeholder="Pincode"
          />
          <label htmlFor="pincode" className={labelClass}>
            Pincode
          </label>
        </div>
      </div>

      <div className="w-full md:w-1/2 px-2">
        <div className="form-floating">
          <input
            type="text"
            className={inputClass}
            id="city"
            name="city"
            value={city}
            onChange={onChange}
            placeholder="City"
            disabled
          />
          <label htmlFor="city" className={labelClass}>
            City
          </label>
        </div>
      </div>

      <div className="w-full md:w-1/2 px-2">
        <div className="form-floating">
          <input
            type="text"
            className={inputClass}
            id="state"
            name="state"
            value={state}
            onChange={onChange}
            placeholder="State"
            disabled
          />
          <label htmlFor="state" className={labelClass}>
            State
          </label>
        </div>
      </div>
    </>
  );
};

export default AddressSection;
