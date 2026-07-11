import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PageNotFound = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 my-3 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap -mx-2">
          <div className="w-full px-2 py-5 bg-brand-cream rounded-card text-center shadow-card">
            <h4 className="p-3 text-4xl text-brand-action">404: Page Not Found</h4>
            <Link
              to="/"
              className="inline-flex items-center gap-1 border border-brand text-brand px-4 py-2 rounded-pill font-semibold mx-4 hover:bg-brand hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Go Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
