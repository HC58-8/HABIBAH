import React, { useState } from "react";
import { 
  FaTimes, FaImage, FaStar, FaLeaf, 
  FaPlusCircle, FaInfoCircle 
} from "react-icons/fa";

const ProductForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  uploadProgress,
  formErrors = {}
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState(initialData?.type || "Zrir");
  const [images, setImages] = useState(initialData?.images || [null, null, null, null]);
  const [mainImageIndex, setMainImageIndex] = useState(initialData?.mainImageIndex || 0);
  const [variants, setVariants] = useState(
    initialData?.variants || ["250g", "500g", "1kg"].map(size => ({ size, price: "" }))
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [ingredients, setIngredients] = useState(initialData?.ingredients || []);
  const [newIngredient, setNewIngredient] = useState("");

  const allowedSizes = ["250g", "500g", "1kg"];
  
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") { 
      e.preventDefault(); 
      handleAddIngredient(); 
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    if (mainImageIndex === index && images.some((_, i) => i !== index && images[i])) {
      const firstAvailableIndex = images.findIndex((_, i) => i !== index && images[i]);
      setMainImageIndex(firstAvailableIndex);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("description", description);
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("mainImageIndex", mainImageIndex);
    images.forEach((img) => {
      if (img && img instanceof File) formData.append("images", img);
    });
    formData.append("variants", JSON.stringify(
      variants.map(v => ({ size: v.size, price: Number(v.price) }))
    ));
    
    onSubmit(formData);
  };

  return (
    <div className="mb-8 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[var(--primary-color)]">
        <h2 className="text-3xl font-bold text-center mb-8 text-[var(--primary-color)]">
          {initialData ? "Modifier le produit" : "Ajouter un nouveau produit"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Nom du produit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: Zrir Royal"
                />
                {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Type de produit</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
                >
                  <option value="Zrir">Zrir</option>
                  <option value="Bsissa">Bsissa</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows="4"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] ${
                    formErrors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Description détaillée du produit..."
                />
                {formErrors.description && <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>}
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Ingrédients <span className="text-red-500">*</span>
                </label>
                <div className="mb-3 flex flex-wrap gap-2">
                  {ingredients.map((ing, index) => (
                    <div key={index} className="bg-[var(--primary-color)] bg-opacity-10 px-3 py-2 rounded-lg flex items-center gap-2 border border-[var(--primary-color)]">
                      <FaLeaf className="text-[var(--primary-color)] text-sm" />
                      <span className="text-gray-700">{ing}</span>
                      <button type="button" onClick={() => handleRemoveIngredient(index)} className="text-red-500 hover:text-red-700 transition">
                        <FaTimes size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
                    placeholder="Ex: Miel pur"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="bg-[var(--secondary-color)] text-white px-4 py-3 rounded-xl hover:bg-[var(--primary-color)] transition flex items-center gap-2"
                  >
                    <FaPlusCircle /> Ajouter
                  </button>
                </div>
                {formErrors.ingredients && <p className="mt-2 text-sm text-red-500">{formErrors.ingredients}</p>}
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <FaInfoCircle /> Appuyez sur Entrée pour ajouter rapidement
                </p>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Variantes (prix en DT)</label>
                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-20 font-semibold text-gray-700">{v.size}</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-3 text-gray-400">DT</span>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={v.price}
                          onChange={e => {
                            const nv = [...variants];
                            nv[i].price = e.target.value;
                            setVariants(nv);
                          }}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
                          placeholder="0.000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {formErrors.variants && <p className="mt-1 text-sm text-red-500">{formErrors.variants}</p>}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Images <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`relative group border-2 border-dashed rounded-xl p-2 transition-all hover:border-[var(--secondary-color)] ${
                        images[index] ? "border-green-300" : "border-gray-300"
                      }`}
                    >
                      {images[index] ? (
                        <div className="relative">
                          <img
                            src={
                              images[index] instanceof File
                                ? URL.createObjectURL(images[index])
                                : `http://localhost:5000${images[index]}`
                            }
                            alt=""
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimes size={12} />
                          </button>
                          {mainImageIndex === index && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white p-1 rounded-full">
                              <FaStar size={12} />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setMainImageIndex(index)}
                            className="absolute bottom-1 left-1 bg-white text-gray-600 text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            Principale
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32">
                          <FaImage className="text-gray-400 mb-1" size={24} />
                          <span className="text-xs text-gray-400">Image {index + 1}</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, index)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                {formErrors.images && <p className="mt-1 text-sm text-red-500">{formErrors.images}</p>}
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <FaInfoCircle /> Survolez une image pour la définir comme principale
                </p>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[var(--secondary-color)] bg-[var(--secondary-color)] bg-opacity-20">
                  Téléchargement
                </span>
                <span className="text-xs font-semibold inline-block text-[var(--secondary-color)]">
                  {uploadProgress}%
                </span>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[var(--secondary-color)] bg-opacity-20">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[var(--secondary-color)] transition-all duration-300"
                />
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
            >
              {initialData ? "Modifier" : "Ajouter"} le produit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;