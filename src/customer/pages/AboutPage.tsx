import type { Category } from "@/shared/api/services/types";
import React, { useEffect, useState } from "react";
import { categoryService } from "@/shared/api/services";
import { useNavigate } from "react-router-dom";
import { AboutHero } from "./about/AboutHero";
import { AboutStory } from "./about/AboutStory";
import { AboutValues } from "./about/AboutValues";
import { AboutMission } from "./about/AboutMission";
import { CategoryMarquee } from "./about/CategoryMarquee";

const AboutPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: number) => {
    navigate("/product", { state: { categoryId } });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.customer.list();
        if (res.data && res.data.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 my-3 py-3">
        <AboutHero />
        <AboutStory />
        <AboutValues />
        <AboutMission />
        <CategoryMarquee categories={categories} onCategoryClick={handleCategoryClick} />
      </div>
    </>
  );
};

export default AboutPage;
