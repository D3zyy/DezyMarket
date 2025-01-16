"use client";
import { image } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
const AddUI = ({ accType , categories, sections}) => {
  const [emojii, setEmojii] = useState(null);
  const [infoTop, setInfoTop] = useState(null);
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
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [filteredSections, setFilteredSections] = useState([]);
  const router = useRouter()

  const fieldTranslation = {
    name: 'Název',
    description: 'Popis',
    location: 'Místo',
    price: 'Cena',
    phoneNumber: 'Telefoní číslo',
  };


  function toggleSteps() {
    const typeOfPosts = document.getElementsByClassName('typeOfPosts');

    if (typeOfPosts.length > 0) {
      // Přepne viditelnost na základě aktuálního stavu
      for (let i = 0; i < typeOfPosts.length; i++) {
        if (typeOfPosts[i].style.display === 'none') {
          typeOfPosts[i].style.display = '';
        } else {
          typeOfPosts[i].style.display = 'none';
        }
      }
    }

    const secondStepDivs = document.getElementsByClassName('addPostSecondStep');
for (let i = 0; i < secondStepDivs.length; i++) {
    if (secondStepDivs[i].style.display === 'block') {
      localStorage.removeItem('typeOfPostEmoji'); 
      localStorage.removeItem('typeOfPostColor'); 
        localStorage.removeItem('typeOfPost'); 
        secondStepDivs[i].style.display = 'none';
    } else {

        localStorage.setItem('typeOfPost', selectedTop?.name ? selectedTop?.name: name);
        secondStepDivs[i].style.display = 'block';
    }
}
const firstStep = document.querySelector('.firstStep');
const secondStep = document.querySelector('.secondStep');

if (firstStep && secondStep) {
    // Zkontrolovat, zda první krok má data-content atribut
    if (firstStep.getAttribute('data-content') === '✓') {
        // Pokud je data-content '✓', odstranit ho a odebrat 'step-primary' ze druhého kroku
        secondStep.classList.remove('step-primary');
        secondStep.setAttribute('data-content', '2');
        firstStep.removeAttribute('data-content');
       
    } else {
        // Jinak nastavit data-content na '✓' a přidat 'step-primary' k druhému kroku
        secondStep.classList.add('step-primary');
        secondStep.setAttribute('data-content', '2');
        firstStep.setAttribute('data-content', '✓');

    }
}



  }

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
    console.log("Zmačknuté odeslání")
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const phoneNumber = formData.get('phonenumber');
    const section = formData.get('section');
    const category = formData.get('category');
    const description = formData.get('description');
    const location = formData.get('location');
    const priceFromUseState = activeButton || formData.get('price');
    console.log("Cena:",priceFromUseState)
    // Append the image files to FormData
    images.forEach((image) => {
        formData.append('images', image); // Use the file objects directly
    });


    formData.append('price', priceFromUseState );
    formData.append('typeOfPost',typeOfPost)


  
    setLoading(true);
    try {
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
} catch (error) {
  console.error("Nastala chyba")
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
      setEmojii(localStorage.getItem('typeOfPostEmoji'))
      setInfoTop(localStorage.getItem('typeOfPostColor'))
      const storedTypeOfPost = localStorage.getItem('typeOfPost');
      setTypeOfPost(storedTypeOfPost);
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
console.log(infoTop)
  return (
    <>
    <div className='flex justify-center gap-4 p-2'> <span style={{ color: infoTop ? infoTop : '' }} className="badge badge-lg badge-outline">
    <span  className={`${emojii ? 'mr-2' : ''}`} dangerouslySetInnerHTML={{ __html: emojii }}></span> {typeOfPost}
</span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" onClick={toggleSteps} className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
</svg></div>
  

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
              pattern="^[^<>;]*$"
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
<div className="w-full">
  {/* Desktop layout */}
  <div
    className="hidden md:flex items-center"
    style={{
      padding: "12px",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
    }}
  >
    <label htmlFor="price" className="block" style={{ flex: "0 0 auto", fontSize: "14px" }}>
      Cena
    </label>
    <input
  min={1}
  max={50000000}
  step={1}
  inputMode="numeric"
  type="number"
  name="price"
  className="input input-bordered hidden md:flex"  // Skrytí na mobilních zařízeních, zobrazení na desktopu
  onChange={(e) => setPrice(e.target.value)}
  disabled={isDisabled}
  style={{
    width: "25%",
    minWidth: "40px",
    fontSize: "12px",
    padding: "6px",
  }}
/>
    <span className="mx-2" style={{ fontSize: "20px" }}>|</span>
    <div className="flex gap-2" style={{ flex: "0 1 auto", justifyContent: "flex-end" }}>
      <button
        type="button"
        onClick={() => handleButtonClick("Dohodou")}
        className="btn btn-active"
        style={{
          transition: "background-color 0.3s, box-shadow 0.3s",
          fontSize: "12px",
          padding: "6px 8px",
          boxShadow: activeButton === "Dohodou" ? "0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))" : "none",
        }}
      >
        Dohodou
      </button>
      <button
        type="button"
        onClick={() => handleButtonClick("V textu")}
        className="btn btn-active"
        style={{
          transition: "background-color 0.3s, box-shadow 0.3s",
          fontSize: "12px",
          padding: "6px 8px",
          boxShadow: activeButton === "V textu" ? "0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))" : "none",
        }}
      >
        V textu
      </button>
      <button
        type="button"
        onClick={() => handleButtonClick("Zdarma")}
        className="btn btn-active"
        style={{
          transition: "background-color 0.3s, box-shadow 0.3s",
          fontSize: "12px",
          padding: "6px 8px",
          boxShadow: activeButton === "Zdarma" ? "0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))" : "none",
        }}
      >
        Zdarma
      </button>
    </div>
  </div>

  {/* Mobile layout */}
  <div className="flex flex-col items-center md:hidden" style={{ padding: "12px", gap: "20px" }}>
    <label
      htmlFor="price"
      style={{
        textAlign: "center",
        fontSize: "20px",
      }}
    >
      Cena
    </label>
    <div className="flex items-center justify-center w-full">
    <input
  min={1}
  max={50000000}
  step={1}
  inputMode="numeric"
  type="number"
  name="price"
  className="input input-bordered"

  onChange={(e) => setPrice(e.target.value)}
  disabled={isDisabled}  // Aktivujte/Deaktivujte input podle potřeby
  style={{
    width: "60%",
    textAlign: "center",
    padding: "8px",
  }}
/>
    </div>
    <span className="flex items-center text-center" style={{ fontSize: "14px" }}>
      nebo
    </span>
    <div className="flex flex-wrap w-full" style={{ gap: "10px", justifyContent: "center" }}>
      <button
        type="button"
        onClick={() => handleButtonClick("Dohodou")}
        className="btn btn-active"
        style={{
          transition: "background-color 0.3s, box-shadow 0.3s",
          fontSize: "12px",
          padding: "6px 8px",
          boxShadow: activeButton === "Dohodou" ? "0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))" : "none",
        }}
      >
        Dohodou
      </button>
      <button
        type="button"
        onClick={() => handleButtonClick("V textu")}
        className="btn btn-active"
        style={{
          transition: "background-color 0.3s, box-shadow 0.3s",
          fontSize: "12px",
          padding: "6px 8px",
          boxShadow: activeButton === "V textu" ? "0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))" : "none",
        }}
      >
        V textu
      </button>
      <button
        type="button"
        onClick={() => handleButtonClick("Zdarma")}
        className="btn btn-active"
        style={{
          transition: "background-color 0.3s, box-shadow 0.3s",
          fontSize: "12px",
          padding: "6px 8px",
          boxShadow: activeButton === "Zdarma" ? "0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))" : "none",
        }}
      >
        Zdarma
      </button>
    </div>
  </div>

  {/* Phone Number */}
  <div className="flex items-center" style={{ padding: "12px", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
    <span htmlFor="phoneNumber" className="block" style={{ fontSize: "14px", flexGrow: 1 }}>
      Telefoní číslo (bez předvolby)
    </span>
    <input
      type="text"
      placeholder="123456789"
      name="phoneNumber"
      className="input input-bordered text-sm p-2 w-[55%]"
      required
      maxLength={9}
      onInput={(e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Povolené pouze číslice
      }}
    />
  </div>
</div>



<div
  className="flex items-center justify-center"
  style={{
    padding: "12px",
    gap: "10px",
  }}
>
  <span
    htmlFor="location"
    className="block"
    style={{
      fontSize: "14px",
      marginRight: "auto", // Přidá prostor vlevo
    }}
  >
    Místo
  </span>

  <select
    className="select select-md select-bordered w-full"
    required
    name="location"
    id="location"
    value={selectedLocation}
    onChange={(e) => setSelectedLocation(e.target.value)}
    style={{
      marginLeft: "auto", // Přidá prostor vpravo
      maxWidth: "300px", // Volitelné, aby šířka nebyla příliš velká
    }}
  >
    <option value="" disabled>
      Vybrat místo
    </option>
    {[
      { id: "praha", name: "Praha" },
      { id: "brno", name: "Brno" },
      { id: "ostrava", name: "Ostrava" },
      { id: "olomouc", name: "Olomouc" },
      { id: "plzen", name: "Plzeň" },
      { id: "stredocesky_kraj", name: "Středočeský kraj" },
      { id: "jihocesky_kraj", name: "Jihočeský kraj" },
      { id: "plzensky_kraj", name: "Plzeňský kraj" },
      { id: "karlovarsky_kraj", name: "Karlovarský kraj" },
      { id: "ustecky_kraj", name: "Ústecký kraj" },
      { id: "liberecky_kraj", name: "Liberecký kraj" },
      { id: "kralovehradecky_kraj", name: "Královéhradecký kraj" },
      { id: "pardubicky_kraj", name: "Pardubický kraj" },
      { id: "jihomoravsky_kraj", name: "Jihomoravský kraj" },
      { id: "zlinsky_kraj", name: "Zlínský kraj" },
      { id: "olomoucky_kraj", name: "Olomoucký kraj" },
      { id: "moravskoslezsky_kraj", name: "Moravskoslezský kraj" },
      { id: "kraj_vysocina", name: "Kraj Vysočina" },
    ].map((location) => (
      <option key={location.id} value={location.name}>
        {location.name}
      </option>
    ))}
  </select>
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
          <Image
     height={1200}
     width={1200}
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

