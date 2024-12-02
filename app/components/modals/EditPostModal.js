"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
async function updatedPost(name, price, category, section, description, postId, location, setSuccess,phoneNumber) {
    if(!section){
      return false
    }
    const response = await fetch('/api/posts', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, price, category, section, description, postId ,location,phoneNumber}),
    });

    console.log("Server response for post edit:", response);
    
    if (!response.ok) { 
      setSuccess(false)
    } else {
      setSuccess(true)
    }
   
    const result = await response.json();
    return result;
    
  
}

function htmlToText(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  return div.textContent || div.innerText || "";
}

export function openEditPostModal() {
  document.getElementById('edit_post_modal').showModal();
}

export function closeEditPostModal() {
  document.getElementById('edit_post_modal').close();
}

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  console.log("odpoved na ziskani kategorii ze server :",res)
  return res.json();
}

async function getSections() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sections`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export const EditPostModal = ({ post, descriptionPost }) => {

  console.log(post)
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [postId, setPostId] = useState(post?.id);
  const [postName, setPostName] = useState(post?.name);
  const [postPrice, setPostPrice] = useState(post?.price);
  const [postDescription, setPostDescription] = useState(descriptionPost);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [location, setPostLocation] = useState(post?.location);
  const [phoneNumber, setPhoneNumber] = useState(post?.phoneNumber);
  const [selectedCategory, setSelectedCategory] = useState(post?.category?.id || "");
  const [selectedSection, setSelectedSection] = useState(post?.section?.id || "");
  const [filteredSections, setFilteredSections] = useState([]);
  const [activeButton, setActiveButton] = useState(null); 
  const [isDisabled, setIsDisabled] = useState(false);
  const [errorValidation, setErrorValidation] = useState(null);
  useEffect(() => {
    const isPriceValid = !isNaN(post.price) && Number.isInteger(Number(post.price));
    console.log(post.price) 
    console.log(Number.isInteger(post.price))
    console.log(typeof post.price === 'number')
    console.log(isPriceValid)
    console.log(post.price)

    if (!isPriceValid ) {
      setActiveButton(post.price);
      setIsDisabled(true)
    } else{
      setIsDisabled(false)
    }
  }, [post.price]);
  const fieldTranslation = {
    category: 'Kategorie',
    section: 'Sekce',
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
 
  
  useEffect(() => {
   
    const fetchCategoriesAndSections = async () => {
      const categoriesData = await getCategories();
      const sectionsData = await getSections();
      setCategories(categoriesData);
      setSections(sectionsData);
    };

    fetchCategoriesAndSections();
  }, []);
  const handleButtonClick = (buttonName) => {
    if (activeButton === buttonName) {
      setIsDisabled(false);
      setActiveButton(null);
    } else {
      setIsDisabled(true);
      setActiveButton(buttonName);

    }
  };

  useEffect(() => {
    setSelectedCategory(post?.category?.id || "");
    setSelectedSection(post?.section?.id || "");
  }, [post]);

  useEffect(() => {
    const filtered = sections.filter(section => section.categoryId === parseInt(selectedCategory));
    setFilteredSections(filtered);
  }, [selectedCategory, sections]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSection(""); // Reset selected section when category changes
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const handlePostChange = async () => {
    setLoading(true);
  
    const price = ["Dohodou", "V textu", "Zdarma"].includes(activeButton) ? activeButton  : postPrice;
    
    let result = await updatedPost(postName, price, selectedCategory, selectedSection, postDescription, postId,location,setSuccess,phoneNumber);
    console.log("Odpověď od serveru :", result);
    setErrorValidation(result)
    setLoading(false);

    if (result?.errors) {
      // If there are errors, do nothing (you can handle the display of errors as needed)
      setSuccess(false); // Optionally set success to false for error handling
    } else {
      // No errors, refresh and close the modal
      router.refresh();
      closeEditPostModal();
    }

  };

  return (
    <dialog id="edit_post_modal" className="modal modal-bottom sm:modal-middle" style={{ marginLeft: "0px" }}>
      <div className="modal-box w-full p-6 flex flex-col items-center">
      
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 text-yellow-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </div>
        <div className="w-full text-left">
        <div className='mb-5' style={{textAlign: "left"}}>{printErrorValidation()}</div>
          <label htmlFor="name">Co nazízím</label>
          <input
            type="text"
            name="name"
            value={postName}
            onChange={(e) => setPostName(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div className="w-full text-left mt-4">

        <div
                className="flex items-center "
                style={{
                  padding: "12px",
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
           
          <label htmlFor="price">Cena</label>
          <input
           min={1}
           max={50000000}
           step={1}
            inputMode="numeric"
            type="number"
            name="price"
            value={postPrice}
            disabled={isDisabled}
            onChange={(e) => setPostPrice(e.target.value)}
            className="input input-bordered w-full"
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
        </div>

        <div className="w-full text-left mt-4">
          <label htmlFor="description" style={{ fontSize: '14px' }}>Popisek</label>
          <textarea
            value={postDescription}
            name="description"
            onChange={(e) => setPostDescription(e.target.value)}
            className="input input-bordered w-full"
            required
            minLength={15}
            maxLength={2000}
            style={{
              fontSize: '14px',
              padding: '8px',
              height: '150px',
              resize: 'none'
            }}
          />
        </div>
        <div className="w-full mt-4 flex items-center"> {/* Přidání items-center */}
<label
    htmlFor="location"
    className="block"
    style={{ fontSize: '14px', flex: '1', marginRight: '8px' }}
  >
    Telefoní číslo (bez předvolby)
  </label>
  <input
    type="text"
    placeholder="123456789"
    value={phoneNumber}
    maxLength={9}
    onInput={(e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Povolené pouze číslice
    }}
    onChange={(e) => setPhoneNumber(e.target.value)}
    name="phoneNumber"
    className="input input-bordered"
    required
    style={{
      fontSize: '14px',
      padding: '8px',
      flex: '1',
    }}
  />
  </div>
        <div className="w-full mt-4 flex items-center"> {/* Přidání items-center */}
  <label
    htmlFor="location"
    className="block"
    style={{ fontSize: '14px', flex: '1', marginRight: '8px' }}
  >
    Místo (Město, Obec nebo kraj)
  </label>
  <input
    minLength={2}
    value={location}
    maxLength={50}
    onChange={(e) => setPostLocation(e.target.value)}
    type="text"
    placeholder={"např. Praha 8, Beroun nebo Pardubický kraj"}
    name="location"
    className="input input-bordered"
    required
    style={{
      fontSize: '14px',
      padding: '8px',
      flex: '1',
    }}
  />
  
</div>

        <div className="w-full text-left mt-4">
          <label htmlFor="category" style={{ fontSize: '14px' }}>Kategorie</label>
          <select
            className="select select-md select-bordered w-full"
            required
            name="category"
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="" disabled>Vybrat kategorii</option>
            {categories?.length > 0 &&
            categories.map(category => (
              <option key={category.id} value={category.id}>
                {htmlToText(category.logo)} {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full text-left mt-4">
          <label htmlFor="section" style={{ fontSize: '14px' }}>Sekce</label>
          <select
      
            className="select select-md select-bordered w-full"
            required
            name="section"
            id="section"
            value={selectedSection}
            onChange={handleSectionChange}
            disabled={!filteredSections.length}
          >
            <option value="" disabled>Vybrat sekci</option>
            {filteredSections.map(section => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex mt-4">
          <button
            onClick={handlePostChange}
            className="btn btn-primary mr-2"
            disabled={loading}
          >
            {loading ? 'Načítání...' : "Uložit"}
          </button>
          <button
            onClick={closeEditPostModal}
            className="btn"
            disabled={loading}
          >
            Zavřít
          </button>
        </div>
      </div>
    </dialog>
  );
};