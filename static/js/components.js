

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
