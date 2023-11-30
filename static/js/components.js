

/**Used to show one modal at a time by removing all existing modals and
 * dispying the required one 
 * @param modalId the id of the modal to be displayed 
 * modalId should be none if no modal should be shown i.e remove all modals
 */
function transitionModal(modalId){
    const modalSections = document.querySelectorAll('.modal-section')
    modalSections.forEach(function(modalSection){
        modalSection.classList.remove('visible')
    })

    if(modalId == 'none'){
        //this means we dont want to show any modal
    }
    else{
        const displayModal = document.getElementById(modalId)
        if(displayModal !== null){
            displayModal.classList.contains('visible')? displayModal.classList.remove('visible'): displayModal.classList.add('visible')
        }
    }
}


/** Used to display the alert modal that has only one action
 * @param modalId the id of the modal to be displayed
 * @param prefix the prefix of all your ids all ids should follow the pattern {prefix-alert-modal-1a}
 * @param message the message you want to diaplay
 * @param onCancel the function that should be executed on click of the button
 */
function setUpAlertModalOneAction(modalId, prefix, message, onCancel, buttonText){
    console.log('setting')
    paragraph_id = `${prefix}-alert-modal-1a-p`
    const modalParagraph = document.getElementById(paragraph_id)
    if(modalParagraph !== null){
        modalParagraph.textContent = message
    }

    buttonId = `${prefix}-alert-modal-1a-button`
    const modalButton = document.getElementById(buttonId)
    if(modalButton !== null){
        modalButton.onclick = onCancel
        modalButton.textContent = buttonText

    }

    transitionModal(modalId)
}

/** Used to display an opaque message modal
 * @param modalId modal to be displayed
 * @param messageTxtId the id of the message text in the modal
 * @param message The message to be displayed
 */
function setupOpaqueModal(modalId, messageTxtId, message){
    modalElement = document.getElementById(modalId)
    messageElement = document.getElementById(messageTxtId)

    messageElement.textContent = message

    transitionModal(modalId)
}

/** Used to display an loading message modal
 * @param modalId modal to be displayed
 * @param messageTxtId the id of the message text in the modal
 * @param message The message to be displayed
 */
function setupLoadingModal(modalId, messageTxtId, message){
    modalElement = document.getElementById(modalId)
    messageElement = document.getElementById(messageTxtId)

    messageElement.textContent = message

    transitionModal(modalId)
}


function showDynamicLoadingModal(message){
    const loadingDiv = document.createElement('div')
    loadingDiv.classList.add('dynamic-d-div')
    const loadingElement = ` <div class="modal-section visible dynamic-modal-section" id="dynamic-loading-001" >
    <div class="modal-content v1-loading-modal-content uncan-modal-con visible">
        <img src="/static/img/loading.gif" alt="loading-image">
        <p class="loading-text" id="loading-text">${message}</p>
    </div>
    </div>`   
    loadingDiv.innerHTML = loadingElement
    document.body.appendChild(loadingDiv)
    return loadingDiv;
}

function showAlertModalOneAction(message, onCancelEvent){
    const alertDiv = document.createElement('div')
    alertDiv.classList.add('dynamic-d-div')
    const alertElement = ` <div class="modal-section visible dynamic-modal-section" id="v2-alert-modal-1a">
    <div class="modal-content v2-alert-modal-1a visible" >
        <p class="alert-message-1a" id="res-alert-modal-1a-p">${message}</p>
        <button class="button-one" id="res-alert-modal-1a-button">Ok</button>
    </div>`

    alertDiv.innerHTML= alertElement
    const actionBtn = alertDiv.querySelector('#res-alert-modal-1a-button')
    if(actionBtn !== null){
        actionBtn.onclick = onCancelEvent
    }
    document.body.appendChild(alertDiv)
    return alertDiv;
}

function clearAllDynamicModals(){
    let dynamicModals = document.querySelectorAll('.dynamic-d-div')
    dynamicModals.forEach((dynamicModal) =>{
       dynamicModal.remove()
    })
}

// console.log('founc a modeal')
// let modal = document.getElementById(dynamicModal.id)
// document.body.removeChild(modal)


function removeDynamicLoadingModal(){
    const dynamicLoadingModal = document.getElementById('dynamic-loading-001')
    if(dynamicLoadingModal){
        document.removeChild(dynamicLoadingModal)
    }
}
