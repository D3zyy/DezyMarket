"use client"
import React from 'react';

export function RecoveryButton({ setRecoverPassword }) {
    return (
        <button
            className="btn btn-link"
            onClick={() => setRecoverPassword(true)}
            style={{ color: 'gray' }}
        >
            Obnovit heslo
        </button>
    );
}
export default RecoveryButton;