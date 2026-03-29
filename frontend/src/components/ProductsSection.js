import React from "react";

import zrirImg from "../images/bsisaclassique.jpg";
import psisaImg from "../images/bsissasésame.jpg";
import mielImg from "../images/bsissapistache1.jpg";

function ProductsSection() {

  const products = [
    {
      id: 1,
      name: "Psisa Classique",
      description: "Psisa Classique préparée selon la recette traditionnelle tunisienne",
      price: "12DT",
      image: zrirImg,
    },
    {
      id: 2,
      name: "Psisa Sésame",
      description: "Psisa préparée avec du sésame",
      price: "15DT",
      image: psisaImg,
    },
    {
      id: 3,
      name: "Psissa Pistache",
      description: "Psissa préparée avec du pistache",
      price: "15DT",
      image: mielImg,
    },

    // copie 2
    {
      id: 4,
      name: "Psisa Classique",
      description: "Psisa Classique préparée selon la recette traditionnelle tunisienne",
      price: "12DT",
      image: zrirImg,
    },
    {
      id: 5,
      name: "Psisa Sésame",
      description: "Psisa préparée avec du sésame",
      price: "15DT",
      image: psisaImg,
    },
    {
      id: 6,
      name: "Psissa Pistache",
      description: "Psissa préparée avec du pistache",
      price: "15DT",
      image: mielImg,
    },

    // copie 3
    {
      id: 7,
      name: "Psisa Classique",
      description: "Psisa Classique préparée selon la recette traditionnelle tunisienne",
      price: "12DT",
      image: zrirImg,
    },
    {
      id: 8,
      name: "Psisa Sésame",
      description: "Psisa préparée avec du sésame",
      price: "15DT",
      image: psisaImg,
    },
    {
      id: 9,
      name: "Psissa Pistache",
      description: "Psissa préparée avec du pistache",
      price: "15DT",
      image: mielImg,
    },
  ];

  return (
    <section className="min-h-screen bg-[#FCFAED] py-16">

      <div className="max-w-7xl mx-auto px-4">

        <div className="text-center mb-12">

          <h2 className="text-5xl font-bold text-[#591C0E]">
            Nos Produits Phares
          </h2>

          <p className="text-gray-600 mt-3">
            Produits artisanaux tunisiens naturels et bio
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {products.map((p) => (

            <div
              key={p.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
            >

              <img
                src={p.image}
                alt={p.name}
                className="w-full object-cover"
              />

              <div className="p-5 space-y-2">

                <h3 className="text-xl font-bold text-[#591C0E]">
                  {p.name}
                </h3>

                <p className="text-gray-600 text-sm">
                  {p.description}
                </p>

                <div className="flex justify-between items-center mt-3">

                  <span className="text-lg font-bold text-[#F2B90C]">
                    {p.price}
                  </span>

                  <button className="bg-[#591C0E] text-white px-4 py-2 rounded-lg hover:bg-[#F2B90C] transition">
                    Voir
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default ProductsSection;