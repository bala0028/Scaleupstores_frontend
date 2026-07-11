import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { settingsService, checkoutService, customerService } from "@/shared/api/services";
import { useAuth, useCart } from "@/shared/stores";
import type { CartItem } from "@/shared/stores";
import { parseAddress, fetchCityStateFromPincode, calcOrderTotals, getEffectivePrice, getImageUrl } from "@/shared/utils";
import { toast } from "sonner";
import { AddressFields } from "../components/AddressFields";
import { CustomerFields } from "../components/CustomerFields";

import { handleCodPayment, handleOnlinePayment } from "../utils/payment";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { type CheckoutInput } from "@/shared/schemas/checkout";
import config from "@/shared/config/clientConfig";

function buildFullAddress(data: CheckoutInput, prefix: "billing" | "shipping"): string {
  return [
    data[`${prefix}_door`],
    data[`${prefix}_street`],
    data[`${prefix}_area`],
    data[`${prefix}_landmark`] && `Landmark: ${data[`${prefix}_landmark`]}`,
    `${data[`${prefix}_city`]}, ${data[`${prefix}_state`]} - ${data[`${prefix}_pincode`]}`,
    "India",
  ]
    .filter(Boolean)
    .join(", ");
}

const defaultValues: CheckoutInput = {
  first_name: "",
  last_name: "",
  contact_number: "",
  secondary_number: "",
  billing_door: "",
  billing_street: "",
  billing_area: "",
  billing_landmark: "",
  billing_city: "",
  billing_state: "",
  billing_pincode: "",
  shipping_door: "",
  shipping_street: "",
  shipping_area: "",
  shipping_landmark: "",
  shipping_city: "",
  shipping_state: "",
  shipping_pincode: "",
  sameAsBilling: false,
  paymentMethod: config.payment.methods[0],
  preferredCourier: "",
};

const Checkout = () => {
  const [formData, setFormData] = useState<CheckoutInput>({ ...defaultValues });

  const { items: cartItems, setCart, clearCart } = useCart();
  const user = useAuth().user;
  const navigate = useNavigate();

  const [gstLoaded, setGstLoaded] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [shipping, setShipping] = useState(0);
  const [GST, setGST] = useState(0);

  const sameAsBilling = formData.sameAsBilling;
  const paymentMethod = formData.paymentMethod;
  const deliveryState = (sameAsBilling ? formData.billing_state : formData.shipping_state) || "";

  // Shipping charge from admin courier slabs: delivery state + total product weight.
  useEffect(() => {
    if (!cartItems.length) return;
    const items = cartItems.map((item) => ({ product: Number(item.id), quantity: item.qty }));
    const timer = setTimeout(() => {
      settingsService
        .calculateCourier(items, deliveryState)
        .then((r: any) => {
          const val = Number(r.data?.data?.courier_charge ?? 0);
          setShipping(isNaN(val) ? 0 : val);
        })
        .catch(() => {
          settingsService
            .getCourier()
            .then((r: any) => {
              const val = Number(r.data?.data?.courier_charge || r.data?.courier_charge || 0);
              setShipping(isNaN(val) ? 0 : val);
            })
            .catch(() => setShipping(0));
        });
    }, 400);
    return () => clearTimeout(timer);
  }, [cartItems, deliveryState]);

  useEffect(() => {
    settingsService
      .getGst()
      .then((r: any) => {
        const val = Number(r.data?.data?.gst_percentage || r.data?.gst_percentage || r.data?.gstPercentage || 0);
        setGST(isNaN(val) ? 0 : val);
      })
      .catch(() => setGST(0))
      .finally(() => setGstLoaded(true));
  }, []);

  const validateCheckoutStock = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await checkoutService.customer.validate(user.id);
      if (!res.data.status) {
        const qtyMap: Record<number, number> = {};
        res.data.valid_items.forEach((i: any) => (qtyMap[i.id] = i.qty));
        setCart(
          cartItems
            .map((item) =>
              qtyMap[item.id] !== undefined ? { ...item, qty: qtyMap[item.id] } : null
            )
            .filter(Boolean) as CartItem[]
        );
        toast.error("Cart updated due to stock/reservation changes");
        navigate("/cart");
      }
    } catch {
      toast.error("Unable to validate checkout");
      navigate("/cart");
    }
  }, [cartItems, setCart, navigate, user]);

  useEffect(() => {
    validateCheckoutStock();
  }, [validateCheckoutStock]);

  // Pre-fill from profile
  useEffect(() => {
    const customerId = user?.id || user?.customer_details?.id;
    if (!customerId) return;
    (async () => {
      try {
        const res = await customerService.customer.profile(customerId);
        const data: any = res.data.data;
        if (!data) return;
        const p = data.address ? parseAddress(data.address) : null;
        const fields: Partial<CheckoutInput> = {
          first_name: data.full_name?.split(" ")[0] || "",
          last_name: data.full_name?.split(" ").slice(1).join(" ") || "",
          contact_number: data.contact_number || "",
          secondary_number: data.secondary_number || "",
          ...(p
            ? {
              billing_door: p.door,
              billing_street: p.street,
              billing_area: p.area,
              billing_landmark: p.landmark,
              billing_city: p.city,
              billing_state: p.state,
              billing_pincode: p.pincode,
              shipping_door: p.door,
              shipping_street: p.street,
              shipping_area: p.area,
              shipping_landmark: p.landmark,
              shipping_city: p.city,
              shipping_state: p.state,
              shipping_pincode: p.pincode,
            }
            : {}),
        };
        setFormData((prev) => ({ ...prev, ...fields }));
      } catch (err) {
        console.error("Failed to load saved address", err);
      }
    })();
  }, [user]);

  const handleSameAsBillingChange = (checked: boolean) => {
    setFormData((prev) => {
      const updated = { ...prev, sameAsBilling: checked };
      if (checked) {
        updated.shipping_door = prev.billing_door;
        updated.shipping_street = prev.billing_street;
        updated.shipping_area = prev.billing_area;
        updated.shipping_landmark = prev.billing_landmark;
        updated.shipping_city = prev.billing_city;
        updated.shipping_state = prev.billing_state;
        updated.shipping_pincode = prev.billing_pincode;
      }
      return updated;
    });
  };

  const fetchAddr = async (pincode: string, type: string) => {
    const result = await fetchCityStateFromPincode(pincode);
    if (result) {
      setFormData((prev) => ({
        ...prev,
        [`${type}_city`]: result.city,
        [`${type}_state`]: result.state,
      }));
    }
  };

  const { gstAmount, shippingCost, totalAmount, baseAmount } = useMemo(() => {
    return calcOrderTotals(cartItems, Number(GST) || 0, Number(shipping) || 0);
  }, [cartItems, shipping, GST]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = formData;

    if (!cartItems.length) {
      toast.error("Cart is empty!");
      return;
    }

    const billingFull = buildFullAddress(data, "billing");
    const shippingFull = data.sameAsBilling
      ? billingFull
      : buildFullAddress(data, "shipping");
    const itemsPayload = cartItems.map((item) => {
      const price = item.offer_price ?? item.price ?? 0;
      const total = price * item.qty;
      const itemTax = (total * (Number(GST) || 0)) / 100;
      return {
        product: item.id,
        quantity: item.qty,
        price,
        tax: itemTax,
        total,
      };
    });

    const orderPayload = {
      customer: Number(user?.id || user?.customer_details?.id),
      firstName: data.first_name,
      lastName: data.last_name,
      contactNumber: data.contact_number,
      secondaryNumber: data.secondary_number,
      preferredCourierService: data.preferredCourier,
      billingAddress: billingFull,
      shippingAddress: shippingFull,
      state: deliveryState,
      paymentMethod: data.paymentMethod,
      items: itemsPayload,
      subtotal: baseAmount + gstAmount,
      tax: Number(GST) || 0,
      shippingCost: shippingCost,
      totalAmount: totalAmount,
    };

    const paymentArgs = {
      orderPayload,
      formData: data,
      cartItems,
      clearCart,
      navigate,
      setProcessing: setProcessingPayment,
    };

    if (data.paymentMethod === "cod") {
      await handleCodPayment(paymentArgs);
    } else {
      await handleOnlinePayment(paymentArgs);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-5 text-center">
        <h4 className="text-brand">No items in Cart</h4>
        <Link
          to="/"
          className="border border-[var(--color-brand)] text-[var(--color-brand)] px-4 py-2 rounded-[var(--radius-pill)] font-semibold hover:bg-[var(--color-brand)] hover:text-white mt-3"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 my-8 lg:my-12 font-body bg-brand-cream">
      {/* Breadcrumb could go here */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <form onSubmit={onSubmit}>
            <div className="mb-8">
              <div className="flex justify-between items-baseline mb-6">
                <h2 className="font-heading text-brand text-3xl font-medium m-0">Contact</h2>
                {!user && (
                  <Link to="/login" className="text-brand-action font-semibold text-sm hover:underline">
                    Signin
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomerFields formData={formData} setFormData={setFormData} />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="font-heading text-brand text-3xl font-medium mb-6">Delivery Details</h2>

              <h5 className="text-brand font-semibold mb-4 mt-6">Billing Address</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AddressFields
                  prefix="billing"
                  formData={formData}
                  setFormData={setFormData}
                  onPincodeChange={fetchAddr}
                />
              </div>

              <div className="my-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <Checkbox
                      id="sameAsBilling"
                      checked={sameAsBilling}
                      onCheckedChange={(checked) => handleSameAsBillingChange(!!checked)}
                      className="w-5 h-5 border-2 border-brand-action data-[state=checked]:bg-brand-action"
                    />
                  </div>
                  <span className="text-brand font-medium">
                    Save this information for the next time shipping (Same as billing)
                  </span>
                </label>
              </div>

              {!sameAsBilling && (
                <>
                  <h5 className="text-brand font-semibold mb-4 mt-6">Shipping Address</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AddressFields
                      prefix="shipping"
                      formData={formData}
                      setFormData={setFormData}
                      onPincodeChange={fetchAddr}
                    />
                  </div>
                </>
              )}
            </div>

            {config.payment.methods.length > 1 && (
              <div className="mb-8">
                <h2 className="font-heading text-brand text-3xl font-medium mb-6">Payment Method</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  {config.payment.methods.map((method) => (
                    <label
                      key={method}
                      className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method
                          ? "border-brand-action bg-white/50 shadow-sm"
                          : "border-brand-border-light bg-transparent hover:border-brand-action/50"
                      }`}
                    >
                      <input
                        type="radio"
                        value={method}
                        className="sr-only"
                        checked={paymentMethod === method}
                        onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: method }))}
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method ? "border-brand-action" : "border-gray-300"
                      }`}>
                        {paymentMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-brand-action" />}
                      </div>
                      <span className="text-brand font-semibold">
                        {method === "cod" ? "Cash on Delivery" : "Online Payment"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-brand-action hover:bg-[#639A40] text-white rounded-full py-6 text-lg font-bold transition-colors mt-4 disabled:opacity-50"
              disabled={processingPayment || !gstLoaded}
            >
              {processingPayment ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2" />
                  Processing...
                </>
              ) : gstLoaded ? (
                `Place Order (₹${totalAmount.toLocaleString()})`
              ) : (
                "Loading GST..."
              )}
            </Button>
          </form>
        </div>

        {/* Right Column: Order Summary (Green Box) */}
        <div className="lg:col-span-5">
          <div className="bg-brand text-brand-cream rounded-[2rem] p-8 shadow-card sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-3xl font-medium m-0">Products</h2>
              <span className="text-brand-action font-bold text-xl">{cartItems.length < 10 ? `0${cartItems.length}` : cartItems.length}</span>
            </div>

            {/* Products List */}
            <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2 mb-8 custom-scrollbar">
              {cartItems.map((item) => {
                const { current } = getEffectivePrice(item);
                return (
                  <div key={item.id} className="flex gap-4 items-center">
                    {item.product_image ? (
                      <img
                        src={getImageUrl(item.product_image)}
                        alt={item.product_name || "Product"}
                        className="w-16 h-16 rounded-[1rem] object-cover bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-[1rem] bg-white flex items-center justify-center shrink-0 text-brand text-xl font-bold">
                        {item.qty}x
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-cream text-base mb-1 truncate">
                        {item.product_name || "Product"}
                      </p>
                      {item.variant_label && (
                        <p className="text-brand-action font-medium text-sm m-0">
                          {String(item.variant_label)}
                        </p>
                      )}
                      <p className="text-brand-cream/70 text-sm mt-0.5">Qty: {item.qty}</p>
                    </div>
                    <span className="text-brand-cream font-medium shrink-0">
                      ₹{(current * item.qty).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <hr className="border-brand-cream/20 mb-6" />

            {/* Gift Card */}
            <div className="flex gap-3 mb-8">
              <input 
                type="text" 
                placeholder="Gift card number" 
                className="flex-1 bg-transparent border border-brand-cream/30 text-brand-cream placeholder:text-brand-cream/50 rounded-full px-4 outline-none focus:border-brand-action transition-colors h-12"
              />
              <button className="bg-brand-action hover:bg-[#639A40] text-white px-6 rounded-full font-bold transition-colors h-12">
                Apply
              </button>
            </div>

            {/* Totals */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-brand-cream/90 font-medium text-lg">Subtotal</span>
                <span className="text-brand-cream font-semibold text-lg">₹{baseAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-cream/90 font-medium text-lg">GST ({GST}%)</span>
                <span className="text-brand-cream font-semibold text-lg">₹{gstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-cream/90 font-medium text-lg">Shipping</span>
                <span className="text-brand-cream/70 font-medium">
                  {shippingCost === 0 ? "Free shipping" : `₹${shippingCost.toLocaleString()}`}
                </span>
              </div>
            </div>

            <hr className="border-brand-cream/20 my-6" />

            <div className="flex justify-between items-center">
              <span className="text-brand-cream font-bold text-xl">Total Price</span>
              <span className="text-brand-cream font-bold text-xl">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
