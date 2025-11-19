import React from "react";
import { motion } from "framer-motion";
import {
  ServerIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: ServerIcon,
      title: t("home.features.devices"),
      description: t("home.features.devices.desc"),
    },
    {
      icon: CpuChipIcon,
      title: t("home.features.licenses"),
      description: t("home.features.licenses.desc"),
    },
    {
      icon: WrenchScrewdriverIcon,
      title: t("home.features.installation"),
      description: t("home.features.installation.desc"),
    },
  ];

  const stats = [
    { label: t("home.stats.customers"), value: "10,000+" },
    { label: t("home.stats.products"), value: "500+" },
    { label: t("home.stats.countries"), value: "25+" },
    { label: t("home.stats.experience"), value: "15+" },
  ];

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100">
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="
          relative 
          bg-gradient-to-br 
          from-[#155F82] to-[#44B3E1]
          dark:from-[#155F82] dark:to-[#44B3E1]
        "
      >
        <div className="mx-auto max-w-7xl px-6 py-28 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg"
          >
            {t("home.hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 mx-auto max-w-2xl text-lg sm:text-xl text-blue-50"
          >
            {t("home.hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex justify-center"
          >
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 rounded-xl font-semibold text-lg bg-white text-[#155F82] shadow-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300"
            >
              {t("home.hero.cta")}
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* STATS */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold bg-gradient-to-r from-[#155F82] to-[#44B3E1] bg-clip-text text-transparent">
                {stat.value}
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            {t("home.features.title")}
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
            {t("home.features.subtitle")}
          </p>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="
                  bg-white dark:bg-gray-900 rounded-2xl p-8
                  border border-gray-200 dark:border-gray-700
                  hover:shadow-xl transition-all duration-300
                "
              >
                <div className="bg-gradient-to-br from-[#155F82] to-[#44B3E1] w-12 h-12 rounded-xl flex items-center justify-center text-white">
                  <f.icon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                  {f.title}
                </h3>

                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-[#155F82] to-[#44B3E1] text-white">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold">
            {t("home.cta.title")}
          </h2>
          <p className="mt-4 text-blue-100 max-w-xl mx-auto">
            {t("home.cta.subtitle")}
          </p>

          <div className="mt-10 flex justify-center gap-6">
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 rounded-lg font-semibold bg-white text-[#155F82] shadow-lg hover:bg-gray-50 hover:scale-105 transition"
            >
              {t("home.cta.browse")}
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 rounded-lg font-semibold border border-white/60 hover:bg-white/10 transition"
            >
              {t("home.cta.createAccount")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
