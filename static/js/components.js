/**Used to show one modal at a time by removing all existing modals and
 * dispying the required one
 * @param modalId the id of the modal to be displayed
 * modalId should be none if no modal should be shown i.e remove all modals
 */
function transitionModal(modalId) {
  const modalSections = document.querySelectorAll(".modal-section");
  modalSections.forEach(function (modalSection) {
    modalSection.classList.remove("visible");
  });

  if (modalId == "none") {
    //this means we dont want to show any modal
  } else {
    const displayModal = document.getElementById(modalId);
    if (displayModal !== null) {
      displayModal.classList.contains("visible")
        ? displayModal.classList.remove("visible")
        : displayModal.classList.add("visible");
    }
  }
}

/** Used to display the alert modal that has only one action
 * @param modalId the id of the modal to be displayed
 * @param prefix the prefix of all your ids all ids should follow the pattern {prefix-alert-modal-1a}
 * @param message the message you want to diaplay
 * @param onCancel the function that should be executed on click of the button
 */
function setUpAlertModalOneAction(
  modalId,
  prefix,
  message,
  onCancel,
  buttonText
) {
  paragraph_id = `${prefix}-alert-modal-1a-p`;
  const modalParagraph = document.getElementById(paragraph_id);
  if (modalParagraph !== null) {
    modalParagraph.textContent = message;
  }

  buttonId = `${prefix}-alert-modal-1a-button`;
  const modalButton = document.getElementById(buttonId);
  if (modalButton !== null) {
    modalButton.onclick = onCancel;
    modalButton.textContent = buttonText;
  }

  transitionModal(modalId);
}

/** Used to display an opaque message modal
 * @param modalId modal to be displayed
 * @param messageTxtId the id of the message text in the modal
 * @param message The message to be displayed
 */
function setupOpaqueModal(modalId, messageTxtId, message) {
  modalElement = document.getElementById(modalId);
  messageElement = document.getElementById(messageTxtId);

  messageElement.textContent = message;

  transitionModal(modalId);
}

/** Used to display an loading message modal
 * @param modalId modal to be displayed
 * @param messageTxtId the id of the message text in the modal
 * @param message The message to be displayed
 */
function setupLoadingModal(modalId, messageTxtId, message) {
  modalElement = document.getElementById(modalId);
  messageElement = document.getElementById(messageTxtId);

  messageElement.textContent = message;

  transitionModal(modalId);
}

/**Displays a modal with two buttons */
function showDynamicLoadingModal(message) {
  transitionModal("none");
  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("dynamic-d-div");
  const loadingElement = ` <div class="modal-section visible dynamic-modal-section" id="dynamic-loading-001" >
    <div class="modal-content v1-loading-modal-content uncan-modal-con visible">
        <img src="/static/img/spinner.gif" alt="loading-image">
        <p class="loading-text" id="loading-text">${message}</p>
    </div>
    </div>`;
  loadingDiv.innerHTML = loadingElement;
  document.body.appendChild(loadingDiv);
  return loadingDiv;
}

function showAlertModalOneAction(message, onCancelEvent) {
  transitionModal("none");
  const alertDiv = document.createElement("div");
  alertDiv.classList.add("dynamic-d-div");
  const alertElement = ` <div class="modal-section visible dynamic-modal-section" id="v2-alert-modal-1a">
    <div class="modal-content v2-alert-modal-1a visible" >
        <p class="alert-message-1a" id="res-alert-modal-1a-p">${message}</p>
        <button class="button-two" id="res-alert-modal-1a-button">Ok</button>
    </div>`;

  alertDiv.innerHTML = alertElement;
  const actionBtn = alertDiv.querySelector("#res-alert-modal-1a-button");
  if (actionBtn !== null) {
    actionBtn.onclick = onCancelEvent;
  }
  document.body.appendChild(alertDiv);
  return alertDiv;
}

function showToast({
  message,
  duration = 5000,
  style = "success",
  onfinshed = function () {},
}) {
  transitionModal("none"); //ensure that all modals are cleared before the toast shows
  document.querySelectorAll(".toast").forEach(function (toast) {
    toast.remove();
  });
  const toastDiv = document.createElement("div");
  toastDiv.classList.add("toast");
  toastDiv.classList.add(`${style}`);
  toastDiv.id = "dynamic-toast-div";

  const iTag =
    style === "success"
      ? '<i class="ri-checkbox-circle-fill"></i>'
      : '<i class="ri-error-warning-line"></i>';

  const toastContent = ` <div class="toast-content">
    <div class="toast-con ${style}">
        <div class="left">
            <div class="icon-con">
            ${iTag}
            </div>
            <div class="message-con">
                <p>${message}</p>
            </div>
        </div>
        <div class="right">
            <i class="ri-close-line" id="remove-${toastDiv.id}"></i>
        </div>
    </div>
    <div class="progress-container">
        <progress id="dynamic-toast-progress" value="0" max="100"> 32% </progress>
    </div>
    </div>`;

  toastDiv.innerHTML = toastContent;
  document.body.appendChild(toastDiv);

  document.getElementById(`remove-${toastDiv.id}`).onclick = function () {
    removeToast(toastDiv.id);
  };

  setTimeout(() => {
    toastDiv.style.transform = "translateY(0)";
    const toastProgess = document.getElementById("dynamic-toast-progress");
    increamentTimePercent = duration / 100;
    const valueIncreamenter = setInterval(() => {
      toastProgess.value += 1;
      if (toastProgess.value >= toastProgess.max) {
        //toast time has ellapsed
        clearInterval(valueIncreamenter);
        removeToast(toastDiv.id);
        onfinshed();
      }
    }, increamentTimePercent);
  }, 10);
  return toastDiv;
}



function removeToast(toastId) {
  const toast = document.getElementById(toastId);
  toast.style.transform = "translateY(-150%)";
}

function showToastById(id) {
  const toast = document.getElementById(id);
  toast.style.transform = "translateY(0)";
  console.log(toast);
}

function showAlertModalTwoAction({
  maintext,
  subtext,
  actiontext = 'Ok',
  onCancel = function () {
    transitionModal("none");
  },
  onAction = function(){}
}) {

  transitionModal('none')
  const modalSection = document.createElement('div')
  modalSection.classList.add('modal-section')
  modalSection.classList.add('visible')

  const modalContent= `<div class="modal-content alert-two-actions-content">
        <h4>${maintext}</h4>
          <p>${subtext}</p>

          <div class="action-buttons-con">
              <button id="cancel-dynamic-alert">Cancel</button>
              <button class="delete-button" id="d-alert-main-action">${actiontext}</button>
          </div>

          <i class="ri-close-line close-modal-icon"></i>
    </div>`

  modalSection.innerHTML = modalContent
  
  modalSection.querySelector('#cancel-dynamic-alert').onclick = onCancel
  modalSection.querySelector('#d-alert-main-action').onclick = onAction
  document.body.appendChild(modalSection)
  console.log('galh')
  return modalSection
}

function showAlertModalImageAction(
  mainMessage,
  subMessage,
  onActionEvent,
  imagePath
) {
  const modalSection = document.createElement("div");
  modalSection.classList.add("modal-section");
  modalSection.classList.add("visible");
  modalSection.classList.add("dynamic-d-div");
  const modalContent = ` <div class="modal-content rocket-alert-modal-content">
    <img src="${imagePath}" alt="Response recorded successfully">
    <div class="messages-container">
        <h3>${mainMessage}</h3>
        <p>${subMessage}</p>
    </div>
    <div class="actions-container">
        <button class="button-two" id="dynamic-button">Done</button>
    </div>
    </div>`;

  modalSection.innerHTML = modalContent;
  const dynamicButton = modalSection.querySelector("#dynamic-button");
  dynamicButton.onclick = onActionEvent;
  document.body.appendChild(modalSection);
  return modalSection;
}

function clearAllDynamicModals() {
  let dynamicModals = document.querySelectorAll(".dynamic-d-div");
  dynamicModals.forEach((dynamicModal) => {
    dynamicModal.remove();
  });
}

// let modal = document.getElementById(dynamicModal.id)
// document.body.removeChild(modal)

function removeDynamicLoadingModal() {
  const dynamicLoadingModal = document.getElementById("dynamic-loading-001");
  if (dynamicLoadingModal) {
    document.removeChild(dynamicLoadingModal);
  }
}
