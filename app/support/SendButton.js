"use client";
import { useState } from "react";

function SendButton({ sessionEmail }) {
    const [isLoading, setIsLoading] = useState(false); 
    const [success, setSuccess] = useState(false); 
    const [text, setText] = useState('');  // Text should be a string
    const [email, setEmail] = useState(sessionEmail ? sessionEmail : '');

    async function sendSupTicket(e) {
        e.preventDefault(); // Prevent form submission
        
        try {
            setIsLoading(true);
            const response = await fetch('/api/sendSupportTicket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,  // Send the email and text to the API
                    text: text
                }),
            });

            const result = await response.json();
            if(result.success){
                setSuccess(true);
            } else {
                console.log("Ticket submission failed:", result.message);
            }
        } catch (error) {
            console.error('Chyba při odesílání požadavku', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <> 
            <form className='space-y-4' onSubmit={sendSupTicket}>
                <label className='form-control w-full'>
                    <span className='label-text text-lg font-medium'>Email</span>
                    <input 
                        value={email} // Using value instead of defaultValue to control the input field
                        onChange={(e) => setEmail(e.target.value)} 
                        type='email' 
                        placeholder='email..' 
                        disabled={isLoading || success} // Disable when loading or success
                        className='input input-bordered w-full p-3 text-lg rounded-lg' 
                    />
                </label>

                <label className='form-control w-full'>
                    <span className='label-text text-lg font-medium'>Text</span>
                    <textarea 
                        disabled={isLoading || success} // Disable when loading or success
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        className='textarea textarea-bordered w-full h-32 p-3 text-lg rounded-lg' 
                        placeholder='Text...'
                    ></textarea>
                </label>

                <button 
    type='submit' 
    className={`btn btn-neutral w-full py-3 text-lg rounded-lg`}
    disabled={isLoading || success} // Disable when loading or success
>
    {isLoading 
        ? 'Odesílání...' 
        : (success 
            ? 'Úspěšně odesláno' 
            : 'Odeslat')}  {/* Show 'Odeslat' when success is false */}
</button>
            </form>
        </>
    );
}

export default SendButton;