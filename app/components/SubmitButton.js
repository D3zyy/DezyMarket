import { button } from "@nextui-org/react";
import { useFormStatus } from 'react-dom'


export function SubmitButton() {
    const {pending} = useFormStatus()
    return(
        <button type="submit" className="btn btn-primary" aria-disabled={pending}>
            Registrovat se
        </button>
    )
}