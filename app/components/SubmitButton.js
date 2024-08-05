import { button } from "@nextui-org/react";



export function SubmitButton(loading) {

    return(<>
        {loading ? (
            <button type="submit" className="btn btn-primary" >
            Registrovat se
           </button>
          ) : (
            
           <div className="flex items-center">
           <div className="spinner"></div> {/* Use CSS spinner */}
           <span className="ml-2">Načítaní..</span>
         </div>
          )}
       </>
    )
}