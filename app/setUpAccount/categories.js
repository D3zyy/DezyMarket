"use client";
import React from 'react';

// Funkce pro zpracování změny
async function changeValue(id, isChecked) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, isChecked })
  });
  let response = await res.json();
  console.log(response);
  alert(response.message || 'Success');
}

const Categories = ({ name, id, isChecked }) => {
  // Funkce, která se volá při změně zaškrtávacího políčka
  const handleChange = (event) => {
    const newChecked = event.target.checked;
    changeValue(id, newChecked); // Volání funkce changeValue s id a novým stavem
  };

  return (
    <div>
      <label className='btn btn-active' htmlFor={name}>
        <span style={{ fontSize: "30px" }}>&#128663;</span> {name}
        <input type="hidden" name="id" value={id} />
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange} // Použití funkce handleChange
          name={name}
        />
      </label>
    </div>
  );
};

export default Categories;