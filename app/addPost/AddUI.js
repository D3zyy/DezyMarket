"use client";
import { image } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
const AddUI = ({ accType , categories, sections}) => {
  const [typeOfPost, setTypeOfPost] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [activeButton, setActiveButton] = useState(null); 
  const [price, setPrice] = useState(''); // name of the current price it could be like not numeric 
  const [images, setImages] = useState([]); // Store actual file objects
  const [imagePreviews, setImagePreviews] = useState([]); // Store URLs for displaying previews
  const [error, setError] = useState(null);
  const [errorFromServer, setErrorFromServer] = useState(null);
  const [errorValidation, setErrorValidation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [filteredSections, setFilteredSections] = useState([]);
  const router = useRouter()

  const fieldTranslation = {
    name: 'Název',
    description: 'Popisek',
    location: 'Místo',
    price: 'Cena',
    phoneNumber: 'Telefoní číslo',
  };
  const printErrorValidation = () => {
    if (!errorValidation || !errorValidation.errors) return null;
  
    return Object.entries(errorValidation.errors).map(([field, messages]) => (
      <div key={field} style={{ color: 'red' }}>
        <strong>{fieldTranslation[field] || field}:</strong> {/* Překlad názvu pole */}
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    ));
  };

  const handleSubmitPost = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const phoneNumber = formData.get('phonenumber');
    const section = formData.get('section');
    const category = formData.get('category');
    const description = formData.get('description');
    const location = formData.get('location');
    const priceFromUseState = activeButton || formData.get('price');

    // Append the image files to FormData
    images.forEach((image) => {
        formData.append('images', image); // Use the file objects directly
    });

    // Append other fields to the FormData
    formData.append('name', name);
    formData.append('section', section);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('price', priceFromUseState);
    formData.append('typeOfPost',typeOfPost)
    formData.append('phoneNumber',phoneNumber)

  
    setLoading(true);

    const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData, // Send the FormData directly
    });

    if (res.ok) {
        let result = await res.json();
       
        setErrorValidation(null)
     
        router.push(`/post/${result.id}`);
       

    } else {
      let result = await res.json();
     
  
      // Obecná kontrola, zda odpověď obsahuje klíč `message`
      if (result?.messageToDisplay) {
      
          setErrorFromServer(result.messageToDisplay); // Nastaví konkrétní chybu podle `message`
      } else if (result?.message && !result?.errors) {
      
          setErrorFromServer("Nastala chyba na serveru. Zkuste to znovu"); // Nastaví konkrétní chybu podle `message`
      } else {
       
          setErrorValidation(result); // Nastaví obecnou validační chybu
      }
  
      setLoading(false); // Ukončení načítání
  }
}


   function htmlToText(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || "";
  }
     // Sledování vybrané kategorie a filtrování sekcí
     useEffect(() => {
        if (selectedCategory) {
            // Filtrujte sekce podle vybrané kategorie
            const filtered = sections.filter(section => section.categoryId === parseInt(selectedCategory));
            setFilteredSections(filtered);
            setSelectedSection(''); // Reset selectedSection, když se změní kategorie
        } else {
            setFilteredSections([]); // Vymažte sekce, pokud není žádná kategorie vybrána
        }
    }, [selectedCategory, sections]); // Závislosti na selectedCategory a sections

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleSectionChange = (e) => {
        setSelectedSection(e.target.value);
    };

   
  const maxUploads = 
  typeOfPost === process.env.NEXT_PUBLIC_BASE_RANK
    ? 15// 5 obrázku základní rank
    : typeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK
    ? 20 // 25 obrázku střední rank
    : typeOfPost === process.env.NEXT_PUBLIC_BEST_RANK
    ? 25 // 30 obrázku nejlepší rank
    : 15; 
  // Handle file input
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Determine the maximum number of uploads based on typeOfPost
    if (selectedFiles.length + images.length > maxUploads) {
        setError(`Maximální počet obrázků je ${maxUploads}. Zkuste to znovu.`);
        return;
    }
    setError(null);

    // Filter valid image files
    const validImages = selectedFiles.filter((file) => file.type.startsWith("image/"));

    // Update the state for actual files and their previews
    setImages((prevImages) => [...prevImages, ...validImages]);
    setImagePreviews((prevImages) => [
        ...prevImages,
        ...validImages.map((file) => URL.createObjectURL(file)),
    ]);
};

// Handle image deletion
const handleDeleteImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevImages) => prevImages.filter((_, i) => i !== index));
};
  const handleButtonClick = (buttonName) => {
    if (activeButton === buttonName) {
      setIsDisabled(false);
      setActiveButton(null);
    } else {
      setIsDisabled(true);
      setActiveButton(buttonName);
      setPrice('');
    }
  };



 

  const handleVisibilityChange = () => {
    const divElement = document.querySelector('.addPostSecondStep');
    const isVisible = divElement && getComputedStyle(divElement).display === 'block';

    if (isVisible) {
      const storedTypeOfPost = localStorage.getItem('typeOfPost');
      if (
        (storedTypeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK && storedTypeOfPost === accType) ||
        (storedTypeOfPost === process.env.NEXT_PUBLIC_BASE_RANK && storedTypeOfPost === accType) ||
        (storedTypeOfPost === process.env.NEXT_PUBLIC_BEST_RANK && storedTypeOfPost === accType)
      ) {
        setTypeOfPost(storedTypeOfPost);
      } else {
        setTypeOfPost(process.env.NEXT_PUBLIC_BASE_RANK);
      }
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(handleVisibilityChange);
    const targetNode = document.querySelector('.addPostSecondStep');

    if (targetNode) {
      observer.observe(targetNode, { attributes: true, attributeFilter: ['style'] });
    }

    return () => {
      if (targetNode) observer.disconnect();
    };
  });

  return (
    <>
      {typeOfPost && (
        <div
          style={{
            marginBottom: "40px",
            padding: "16px",
            width: "100%",
            maxWidth: "618px",
            margin: "0 auto",
          }}
          className="typeOfPosts flex flex-col  justify-center gap-2 p-4"
        >
    {errorFromServer && (
      
  <div className="flex items-start gap-3 py-3  text-red-600   font-medium mt-4 transition-transform transform hover:scale-105">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-6 h-6 text-red-500"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
    <span>{errorFromServer}</span>
  </div>
)}
          
            
           {printErrorValidation()}
          <form  onSubmit={handleSubmitPost} >
            <div className="py-2 w-full">
              <label htmlFor="name" className="block" style={{ fontSize: '14px'}}>Co nabízím</label>
              <input
                minLength={5} // Minimální délka 5 znaků
                maxLength={200}
              pattern="^[A-Za-z0-9á-žÁ-Ž., /-]*(?![<>;])$"
                type="text"
                placeholder={"např. Iphone 14, Kolo, Auto"}
                name="name"
                className="input input-bordered w-full"
                required
                style={{ fontSize: '14px', padding: '8px' }}
              />
            </div>
            





            <div className="w-full">
  {/* Tento blok bude viditelný pouze na desktopech (md a výše) */}
  <div
    className="hidden md:flex items-center"
    style={{
      padding: "12px",
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '10px',
    }}
  >
    <label htmlFor="category">Kategorie</label>
    <select className="select select-md select-bordered w-full" required name="category" id="category" onChange={handleCategoryChange} value={selectedCategory}>
      <option value="" disabled>Vybrat kategorii</option>
      {categories.map(category => (
        <option key={category.id} value={category.id}>
          {htmlToText(category.logo)} {category.name}
        </option>
      ))}
    </select>
    <span className="mx-2" style={{ fontSize: '20px' }}>&</span>
    <label htmlFor="section">Sekce</label>
    <select className="select select-md select-bordered w-full" required name="section" id="section" value={selectedSection} onChange={handleSectionChange} disabled={!selectedCategory}>
      <option value="" disabled>Vybrat sekci</option>
      {filteredSections.map(section => (
        <option key={section.id} value={section.id}>
          {section.name}
        </option>
      ))}
    </select>
  </div>

  {/* Tento blok bude viditelný pouze na mobilních zařízeních (méně než md) */}
  <div className="md:hidden w-full text-left mt-4">
    <label htmlFor="category" style={{ fontSize: '14px' }}>Kategorie</label>
    <select className="select select-md select-bordered w-full" required name="category" id="category" value={selectedCategory} onChange={handleCategoryChange}>
      <option value="" disabled>Vybrat kategorii</option>
      {categories?.length > 0 && categories.map(category => (
        <option key={category.id} value={category.id}>
          {htmlToText(category.logo)} {category.name}
        </option>
      ))}
    </select>
  </div>

  <div className="md:hidden w-full text-left mt-4">
    <label htmlFor="section" style={{ fontSize: '14px' }}>Sekce</label>
    <select className="select select-md select-bordered w-full" required name="section" id="section" value={selectedSection} onChange={handleSectionChange} disabled={!filteredSections.length}>
      <option value="" disabled>Vybrat sekci</option>
      {filteredSections.map(section => (
        <option key={section.id} value={section.id}>
          {section.name}
        </option>
      ))}
    </select>
  </div>
</div>


            <div className="py-2 w-full">
              <label htmlFor="description" className="block" style={{ fontSize: '14px' }}>Popisek</label>
              <textarea 

  placeholder='Prodám.. Nabízím.. Daruji..'
  name="description"
  className="input input-bordered w-full"
  required
  minLength={15} // Minimální délka 5 znaků
  maxLength={2000} // Maximální délka 500 znaků
  style={{ 
    fontSize: '14px', 
    padding: '8px', 
    height: '150px', // Počáteční výška
    resize: 'none' // Zamezení změny velikosti
  }}
/>
            </div>
            <div className="w-full">
              <div
                className="flex items-center "
                style={{
                  padding: "12px",
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <label htmlFor="price" className="block" style={{ flex: "0 0 auto", fontSize: '14px' }}>Cena</label>
                <input
                  min={1}
                  max={50000000}
                  step={1}
                  inputMode="numeric"
                  type="number"
                  name="price"
                  className="input input-bordered"
                  required
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isDisabled}
                  style={{
                    width: '25%',
                    minWidth: '40px',
                    fontSize: '12px',
                    padding: '6px',
                  }}
                />

                <span className="mx-2" style={{ fontSize: '20px' }}>|</span>

                <div className="flex gap-2" style={{ flex: "0 1 auto", justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleButtonClick('Dohodou')}
                    className="btn btn-active"
                    style={{
                      transition: 'background-color 0.3s, box-shadow 0.3s',
                      fontSize: '12px',
                      padding: '6px 8px',
                      boxShadow: activeButton === 'Dohodou' ? '0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))' : 'none',
                    }}
                  >
                    Dohodou
                  </button>
                  <button
                    type="button"
                    onClick={() => handleButtonClick('V textu')}
                    className="btn btn-active"
                    style={{
                      transition: 'background-color 0.3s, box-shadow 0.3s',
                      fontSize: '12px',
                      padding: '6px 8px',
                      boxShadow: activeButton === 'V textu' ? '0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))' : 'none',
                    }}
                  >
                    V textu
                  </button>
                  <button
                    type="button"
                    onClick={() => handleButtonClick('Zdarma')}
                    className="btn btn-active"
                    style={{
                      transition: 'background-color 0.3s, box-shadow 0.3s',
                      fontSize: '12px',
                      padding: '6px 8px',
                      boxShadow: activeButton === 'Zdarma' ? '0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))' : 'none',
                    }}
                  >
                    Zdarma
                  </button>
                </div>

              </div>
              <div
  className="flex items-center"
  style={{
    padding: "12px",
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
  }}
>
        <span
    htmlFor="phonenumber"
    className="block"
    style={{ fontSize: '14px', flexGrow: 1 }}
  >
    Telefoní číslo (bez předvolby)
  </span>
  <input
  type="text"
  placeholder="123456789"
  name="phonenumber"
  className="input input-bordered text-sm p-2 w-[55%]"
  required
  maxLength={9}
  onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Povolené pouze číslice
  }}
/>  
</div>
              <div
  className="flex items-center"
  style={{
    padding: "12px",
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
  }}
>

  <span
    htmlFor="location"
    className="block"
    style={{ fontSize: '14px', flexGrow: 1 }}
  >
    Místo (Město, Obec nebo kraj)
  </span>
  <input
    minLength={2} // Minimální délka 5 znaků
    maxLength={50}
    type="text"
    placeholder={"např. Praha 8, Beroun nebo Pardubický kraj"}
    name="location"
    className="input input-bordered"
    required
    style={{
      fontSize: '14px',
      padding: '8px',
      width: '55%', // Adjust this percentage to control the input width
    }}
  />
</div>
      




              <div className="w-full flex flex-col">
      

      {/* Image input */}
      <label >
      <input
      style={{ display: "none" }}
      type="file"
      aria-label="yo"
      title="Title"
      accept="image/*"
      multiple
      onChange={handleImageChange}
      className="mb-4"
      disabled={images.length >= ( maxUploads) }
    />
    <div style={{marginTop: "7px"}} className=" flex flex-col items-center justify-center mb-2 relative border-2 border-dotted border-gray-500 rounded-lg p-4">
      {/* Blur effect when input is disabled */}
      {images.length >=  maxUploads
       && (
        <div className="absolute inset-0 backdrop-blur-sm rounded-lg" />
      )}
      {/* Display the count above the blur when the limit is reached */}
      {images.length >= 1
       ? (
        <div className="flex items-center justify-center  relative z-10">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 mr-2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
        </svg>
        <span className="text-gray-500 text-center">
          Obrázky  {images.length}/{maxUploads}
        </span>
    </div>
      ) : (
        // "Nahrát obrázky" text when the limit is not reached
        <div className="flex items-center justify-center relative z-10">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 mr-2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
        </svg>
        <span className="text-center text-gray-500 relative z-10">Nahrát obrázky</span>
        </div>
      )}
       <span className="text-red-400 text-center">
       {error}
        </span>
    </div>
    </label>
      {/* Image preview */}
      <div  style={{marginTop: "10px",marginBottom:"10px"}} className="flex flex-wrap gap-6 justify-center items-center">
      {imagePreviews.length > 0 &&
    imagePreviews.map((imagePreview, index) => (
        <div key={index} className="relative">
          <img
          
    src={imagePreview}
    alt={`Náhled ${index + 1}`}
    
    className="h-32 w-32 object-cover rounded shadow-md"
/>
            
            <div
                className="absolute bottom-0 left-1/2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-700"
                style={{ transform: "translate(-50%, 50%)" }} // Center horizontally, slightly below the image
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24">
                    <text
                        x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
                        fontSize="12" fill="currentColor"
                    >
                        {index + 1}
                    </text>
                </svg>
            </div>
            <button
                type="button"
                onClick={() => handleDeleteImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
                style={{ transform: "translate(50%, -50%)" }} // Ensure button stays aligned
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    ))}
      </div>
    </div>
                

   

              
              
              
              <div className="w-full flex">
              <button
              disabled={loading}
              style={{ marginTop: "10px" }}
              className="btn btn-block btn-primary"
              type="submit"
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Vytvořit"}
            </button>
            </div>
            </div>
          </form>
        </div>
      )}
      <style jsx>{`
        /* Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Firefox */
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </>
  );
};

export default AddUI;

