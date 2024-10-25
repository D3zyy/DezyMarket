"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

async function updatedPost(name, price, category, section) {
  try {
    const response = await fetch('/api/posts', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, price, category, section }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [postName, setPostName] = useState(post?.name);
  const [postPrice, setPostPrice] = useState(post?.price);
  const [postDescription, setPostDescription] = useState(descriptionPost);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(post?.category?.id || "");
  const [selectedSection, setSelectedSection] = useState(post?.section?.id || "");
  const [filteredSections, setFilteredSections] = useState([]);

  useEffect(() => {
    const fetchCategoriesAndSections = async () => {
      const categoriesData = await getCategories();
      const sectionsData = await getSections();
      setCategories(categoriesData);
      setSections(sectionsData);
    };

    fetchCategoriesAndSections();
  }, []);

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
    await updatedPost(postName, postPrice, selectedCategory, selectedSection);
    setLoading(false);
    location.reload();
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
          <label htmlFor="price">Cena</label>
          <input
            min={1}
            max={5000000}
            inputMode="numeric"
            type="number"
            name="price"
            value={postPrice}
            onChange={(e) => setPostPrice(e.target.value)}
            className="input input-bordered w-full"
          />
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
            {categories?.map(category => (
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