
import { getSession } from '../authentication/actions';
import { openLoginModal } from './modals/LoginModal'

const AddOfferButton = async (loginModal ) => {

 const session = await getSession();

  return (
    <div>
       
        <div className="hidden sm:flex">
          <button
            id="add-offer-btn"
            onClick={openLoginModal}
            onTouchStart={openLoginModal}
            className="btn"
            style={{ margin: "0px 10px" }}
          >
            Přidat inzerát
          </button>
        </div>
    
    </div>
  );
}

export default AddOfferButton;