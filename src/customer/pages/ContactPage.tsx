import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { contactService } from "@/shared/api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContactInput } from "@/shared/schemas/contact";

const defaultValues = { name: "", email: "", phone: "", message: "" } as ContactInput;

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: "info@glimpse.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (800) 123-4567",
  },
  {
    icon: MapPin,
    label: "Location",
    value: ["Silicon Valley, CA 94043", "United States"],
  },
];

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactInput>({ ...defaultValues });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg(null);
    try {
      const res = await contactService.customer.create(formData);
      if (res.data.status) {
        setResponseMsg("Message sent successfully!");
        setFormData({ ...defaultValues });
      } else {
        setResponseMsg("Something went wrong. Try again!");
      }
    } catch {
      setResponseMsg("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1200px] mx-auto py-20 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* ─── Left: Contact Information ─── */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-1.5 text-sm font-medium">
            <MessageCircle size={16} />
            Contact
          </div>

          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            How can we help
            <br />
            you today?
          </h1>

          <p className="text-gray-500 leading-relaxed max-w-[320px]">
            Our dedicated customer support team is just a message or call away.
          </p>

          <div className="space-y-6 pt-4">
            {contactDetails.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="shrink-0 bg-purple-100 rounded-full p-2.5">
                  <item.icon size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  {Array.isArray(item.value) ? (
                    item.value.map((line) => (
                      <p key={line} className="text-gray-500">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right: Contact Form ─── */}
        <div>
          <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-5">
            <div>
              <label htmlFor="Name" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Name
              </label>
              <Input
                type="text"
                id="Name"
                placeholder="Enter your name"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="Email" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Email
              </label>
              <Input
                type="email"
                id="Email"
                placeholder="name@example.com"
                required
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="Phone" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Phone Number
              </label>
              <Input
                type="tel"
                id="Phone"
                placeholder="Enter your phone number"
                required
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="Message" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Message
              </label>
              <Textarea
                rows={5}
                id="Message"
                placeholder="Enter your message"
                required
                value={formData.message || ""}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <Button
              variant="brand"
              className="w-full rounded-full py-2.5 font-semibold"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
            {responseMsg && (
              <p className="text-center text-sm text-brand font-medium">{responseMsg}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
