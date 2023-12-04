const removeModal = document.getElementById('remove-modal')
const modal = document.querySelector('.modal-container')



if(removeModal !== null){
    removeModal.addEventListener('click', ()=>{
    modal.classList.remove('visible')
})
}

const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;



function handleCredentialResponse(response){
     const responsePayload = decodeJwtResponse(response.credential);
     loadingDiv = showDynamicLoadingModal(`Setting up your account`);

    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let formData = new FormData()
    formData.append('id_token', response.credential)
    formData.append('email', responsePayload.email)
    formData.append('username', responsePayload.name)
    

     
    fetch('/google-login/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: formData
     }).then(response => {
        if(response.ok){
          window.location.href = '/';//this means user is logged in 
        }
        return response.json()
     })
     .then(data => {
       if(data.status !== 200){//this means the token was not verified 
        const onCancel = function (){
            clearAllDynamicModals()
        }

        showAlertModalOneAction(data.message, onCancel)

       }
       else{
        loadingDiv.remove()
       }
       
     })

    //  console.log("ID: " + responsePayload.sub);
    //  console.log('Full Name: ' + responsePayload.name);
    //  console.log('Given Name: ' + responsePayload.given_name);
    //  console.log('Family Name: ' + responsePayload.family_name);
    //  console.log("Image URL: " + responsePayload.picture);
    //  console.log("Email: " + responsePayload.email);

}


/** this function fetches the payload from the jwt token recieved  */
function decodeJwtResponse(credential) {
    // Split the JWT into header, payload, and signature
    const jwtParts = credential.split('.');
    
    // Decode the payload (second part of the JWT)
    //the atob function is used to decode a string which has been encoded in base64 encoding
    const decodedPayload = JSON.parse(atob(jwtParts[1]));
    return decodedPayload;
  }



