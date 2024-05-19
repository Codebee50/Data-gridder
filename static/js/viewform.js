let hiddenFormcode = document.getElementById("hd-code");
let formcode = hiddenFormcode.value;

let tableCon = document.querySelector(".table-container");
const changeText = document.getElementById("txt-change-file");
const fileInput = document.getElementById("file");
const editFormButton = document.getElementById("edit-form-button");
const modal = document.querySelector(".modal-container");
const removeModal = document.getElementById("discard-btn");
const formNameInput = document.getElementById("form-name-input");
const saveBtn = document.getElementById("save-btn");
const loadingDiv = document.querySelector(".loading");
const fileName = document.getElementById("file-name");
const content = document.querySelector(".content");
const successDiv = document.querySelector(".success-div");
const peopleCount = document.getElementById("people-count");
const generateBtn = document.getElementById("generate-btn");

const downloadModel = document.querySelector(".download-modal");
const cancelDownload = document.getElementById("cancel-download");
const downloadAlert = document.querySelector(".download-alert");
const downloadContent = document.querySelector(".download-content");
const removeDownloadModal = document.getElementById("remove-download-modal");

const viewDetails = document.getElementById("see-details");
const displayDetailsModal = document.getElementById("display-details-modal");
const removeDetails = document.getElementById("btn-done");
const domainInput = document.getElementById("domain");
const orderFactor = document.getElementById("order-factor");
const alphabeticalOrderCheck = document.getElementById("alph-order");

const copyButtons = document.querySelectorAll(".btn-copy");
const deleteFormBtn = document.getElementById("btn-delete-form");
const btnRemoveFile = document.getElementById("btn-remove");
const txtInputWordCount = document.getElementById('txt-input-word-count')



let factor = "none"; //this is holds if what we want to order the list by
let transverse = "asc"; //this indicates if the list should be ascending or descending
let form;
let fileRemoved = false;
let initialState;
let originalDocumentName;
const inputMaxLength = 60

deleteFormBtn.addEventListener("click", function () {
  showDynamicLoadingModal("Deleting form..."); //show loading modal

  //send request to delete form
  deleteForm(this.dataset.formcode);
});

const radioSelects = document.querySelectorAll(".radio-select");
radioSelects.forEach(function (radioSelect) {
  radioSelect.addEventListener("click", function (e) {
    selectStateUi(radioSelect)
  });
});

function selectStateUi(radioSelect){
  if(radioSelect){
    const radioValue = radioSelect.dataset.radiovalue;
    const radioElement = document.getElementById(`radio-${radioValue}`);
    if (radioElement) radioElement.checked = true;
  
    radioSelects.forEach((select) => select.classList.remove("selected"));
    radioSelect.classList.add("selected");
  }
 
}

function deleteForm(formcode) {
  fetch(`/deleteform/${formcode}/`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("just-deleted", data.message);
      window.location.href = "/dashboard";
    })
    .catch((error) => {
      console.error(error);
      // showAlertModalOneAction(data.message, function(){
      //   window.location.href = '/dashboard'
      // })
      localStorage.setItem(
        "just-deleted",
        "An error occured while deleting form"
      );
      window.location.href = "/dashboard";
    });
}

class FormEditable {
  //this class models the fields that can be editable in a form, it is later used to compare changes in the form after edit
  constructor(formcode, formname, description, status) {
    this.formcode = formcode
    this.formname = formname;
    this.description = description;
    this.status = status;
    this.state = status === "OP" ? "Open" : "Locked";
  }

  compare(state) {
    const differences = [];
    if (!(state instanceof FormEditable)) {
      differences.push(-1);
      return differences;
    }

    if (this.formname !== state.formname) {
      differences.push("formname");
    }

    if (this.description !== state.description) {
      differences.push("description");
    }

    if (this.status !== state.status) {
      differences.push("state");
    }

    return differences;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // const csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;
  fetch(`/getformandvalues/${formcode}/`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      const fields = JSON.parse(data.form)[0].fields;
      makeTable(data);
      initialState = new FormEditable(
        fields.form_code,
        fields.form_name,
        fields.description,
        fields.status
      );
    })
    .catch((error) => {
      console.error(error);
    });
});

changeText.addEventListener("click", function () {
  fileInput.click();
});

fileInput.addEventListener("change", function () {
  if (fileInput.value === "") {
    fileName.textContent = "empty";
    btnRemoveFile.style.display = "none";
  } else {
    fileName.textContent = this.files[0].name;
    btnRemoveFile.style.display = "block";

    fileRemoved = false; //indicate that a file was added
  }
});

btnRemoveFile.addEventListener("click", function () {
  fileInput.value = "";

  //Trigger a change event for the file input
  const event = new Event("change");
  fileInput.dispatchEvent(event);
  fileRemoved = true; //indicate that the file was removed
});


editFormButton.addEventListener("click", displayEditModal);

formNameInput.addEventListener('input', function(){
  const inputValueLength = setWordCount()
  if (inputValueLength >= inputMaxLength){
      formNameInput.value = formNameInput.value.slice(0, inputMaxLength);
  }
})

function displayEditModal() {
  setWordCount()
  transitionModal("edit-form-modal-section", function(){
    resetEditModal()
    transitionModal('none')
  });
  // modal.classList.add("visible");
  // content.classList.add("visible");
}

function setWordCount(){
  const inputValueLength = formNameInput.value.length
  txtInputWordCount.textContent = `${inputValueLength}/${inputMaxLength}`
  return inputValueLength
}

/**Adding event listeners to the copy link and copy code buttons */
copyButtons.forEach(function (copyBtn) {
  copyBtn.addEventListener("click", function () {
    const oldTextContent = this.textContent;
    txtId = `txt-${this.id}`;
    const textToCopy = document.getElementById(txtId).textContent; //getting the id of the paragraph tag where the text to be copied is in

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = oldTextContent;
        }, 1300);
      })
      .catch((error) => {
        alert("An error occured while trying to copy item");
        console.error(error);
      });
  });
});

removeModal.addEventListener("click", function () {
  modal.classList.remove("visible");
});

$(document).on("submit", "#edit-form", function (e) {
  e.preventDefault();
});

saveBtn.addEventListener("click", function () {
  const status = document.querySelector(
    'input[name="form-status"]:checked'
  ).value;
  const description = document.getElementById("description").value;
  const finalState = new FormEditable(initialState.formcode, formNameInput.value, description, status);
  buildReviewChangesModal(finalState, initialState.compare(finalState));
});

function restAndRemoveEdit(){
  resetEditModal()
  transitionModal('none')
}

/**Resets the value of the edit modal to the initial state */
function resetEditModal(){
  formNameInput.value = initialState.formname
  document.getElementById("description").value = initialState.description
  const radioSelect = document.querySelector(`.radio-select[data-radiovalue="${String(initialState.state).toLowerCase()}"]`);
  selectStateUi(radioSelect)
  setFileName(originalDocumentName)
  setWordCount()
}

/**returns an array, with its first value s a boolean indicating if the
 * appended document was modified or not and second element is a description of
 * what happed to the document
 */
function fileChanged(fileElement) {
  const operatiion = getFileOp(fileElement);
  if (operatiion === "none") {
    return [false, ""];
  } else if (operatiion === "removed") {
    return [true, "empty"];
  } else {
    return [true, fileElement.files[0].name];
  }
}

/** builds and displays a modal that shows the changes
 *  in the form state from when it was loaded to when it was modified */
function buildReviewChangesModal(formState, differences) {
  const [fileModified, message] = fileChanged(fileInput);

  if (!(differences.length > 0) && !fileModified) {
    showAlertModalOneAction(
      "You haven't made any changes to your form settings; everything remains unchanged as per your initial configuration. If you have any further adjustments or updates, feel free to make them.",
      displayEditModal
    );
    return;
  }

  const changesContainer = document.querySelector(".changes-container");
  const btnSaveChanges = document.getElementById('btn-save-changes')
  changesContainer.innerHTML = "";
  differences.forEach(function (difference) {
    const differenceValue = formState[difference];
    const changeHtml = `<div class="change">
                            <h4>${difference}:</h4>
                            <p>${differenceValue}</p>
                        </div>`;
    changesContainer.insertAdjacentHTML("afterbegin", changeHtml);
  });

  if (fileModified) {
    const changeHtml = `<div class="change">
                            <h4>appended document:</h4>
                            <p>${message}</p>
                        </div>`;
    changesContainer.insertAdjacentHTML("afterbegin", changeHtml);
  }

  btnSaveChanges.onclick = function(){
    showDynamicLoadingModal('Applying changes..')
    modifyForm(formState.formname, formState.formcode, fileInput, formState.status, formState.description);
  }

  transitionModal("rev-changes-modal");
}

/**returns the operatino that was performed on the appended document
 * i.e if it was removed, updated or remained unchanged
 */
function getFileOp(fileElement) {
  let fileop = fileElement.files[0] == undefined ? "none" : "updated";
  fileop = fileRemoved ? "removed" : fileop;
  return fileop;
}

/**Sends a request to the database to
 * update the form with the specified formcode  */
function modifyForm(newname, formcode, fileElement, status, description) {
  if (newname === "") {
    alert("Form name cannot be blank");
    return; //avoid executing the rest of the function
  }

  const formData = new FormData();

  const file = fileElement.files[0];
  const fileop = getFileOp(fileElement);

  const csrfToken = document.querySelector(
    "input[name=csrfmiddlewaretoken]"
  ).value;

  formData.append("formname", newname);
  formData.append("document", file);
  formData.append("formcode", formcode);
  formData.append("status", status);
  formData.append("description", description);
  formData.append("fileop", fileop);
  formData.append("csrfmiddlewaretoken", csrfToken);

  fetch("/modifyform", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      const success = data.statuscode === 200?true : false
      showToast({
        message: data.message,
        duration: success? 2000 : 6000, 
        style: success? 'success': 'failed',
        onfinshed: success ? ()=> {window.location.reload()}: ()=>{}
      })
    });
}

/** sets the file name in the ui */
function setFileName(name){
  if (name === "document_name") {
    fileName.textContent = "empty";
    btnRemoveFile.style.display = "none";
  } else {
    btnRemoveFile.style.disabled = "block";
    fileName.textContent = name;
  }
}

/**Uses the form values to populate the table in the ui*/
function makeTable(data) {
  //open the table tag, open the table head and open the tr for the table head
  let table = "<table><thead><tr>";

  //getting the serialized form
  form = JSON.parse(data.form);

  formNameInput.value = form[0].fields.form_name;

  originalDocumentName = form[0].fields.original_doc_name;
  setFileName(originalDocumentName)
 
  let fields = JSON.parse(form[0].fields.fields);

  fields.forEach(function (field) {
    table += "<th>" + field.name + "</th>";
    if (field.datatype !== "empty") {
      const optionElementAcending = document.createElement("option");
      optionElementAcending.value = field.name;
      optionElementAcending.text = field.name + " (Ascending)";
      optionElementAcending.id = "asc";
      orderFactor.appendChild(optionElementAcending);

      const optionElementDescending = document.createElement("option");
      optionElementDescending.value = field.name;
      optionElementDescending.text = field.name + " (Descending)";
      optionElementDescending.id = "desc";
      orderFactor.appendChild(optionElementDescending);
    }
  });

  //close the tr for the table head, close the table head and open the table body
  table += "</tr></thead><tbody>";

  data.formvalues.forEach(function (formvalue) {
    let fieldValues = JSON.parse(formvalue.field_values);
    if (fieldValues.length >0){
      table += "<tr>";
      let index = 0;
      fields.forEach(function (field) {
        if (field.datatype == "empty") {
          table += "<td>  </td>";
        } else {
          table += "<td>" + fieldValues[index].value + "</td>";
          index += 1;
        }
      });
    }
   
  });

  table += "</table>";
  tableCon.innerHTML = table;

  alphabeticalOrderCheck.addEventListener("change", function () {
    if (alphabeticalOrderCheck.checked) {
      factor = orderFactor.value;
      transverse = orderFactor.id;
    } else {
      factor = "none";
    }
  });

  orderFactor.addEventListener("change", () => {
    if (alphabeticalOrderCheck.checked) {
      factor = orderFactor.value;
      transverse = orderFactor.id;
    }
  });
}

generateBtn.addEventListener("click", function () {
  downloadAlert.classList.remove("visible");
  downloadContent.classList.add("visible");
  downloadModel.classList.add("visible");
  const editName = document.getElementById("edit-name-i");
  const cancelEdit = document.getElementById("cancel-edit");
  const confirmEdit = document.getElementById("confirm-edit");
  const editContainer = document.querySelector(".edit-container");
  const newNameInput = document.getElementById("new-name-edt");
  const txtFileName = document.getElementById("txt-file-name");
  const downloadBtn = document.getElementById("download-btn");
  const isNumberedCheck = document.getElementById("number-document");

  let linkTag = document.getElementById("download-link-tag");

  let newName = form[0].fields.original_doc_name;
  if (newName == "document_name") {
    newName = form[0].fields.form_name + ".docx";
  }

  txtFileName.textContent = newName;

  editName.addEventListener("click", function () {
    editContainer.classList.add("visible");
  });
  cancelEdit.addEventListener("click", function () {
    editContainer.classList.remove("visible");
  });

  confirmEdit.addEventListener("click", function () {
    if (newNameInput.value == "") {
    } else {
      inputVal = newNameInput.value.trim();

      newName = inputVal + ".docx";
      txtFileName.textContent = newName;
      editContainer.classList.remove("visible");
    }
  });

  downloadBtn.addEventListener("click", function () {
    isNumbered = isNumberedCheck.checked.toString();
    isAlphabeticalOrdered = alphabeticalOrderCheck.checked.toString();
    //linkTag.href = '/downloaddoc/' + formcode + '/' + newName + '/'
    let genDocumentName = newName.replace(/ /g, "_");
    linkTag.href =
      "/generatedoc/" +
      formcode +
      "/" +
      genDocumentName +
      "/" +
      isNumbered +
      "/" +
      isAlphabeticalOrdered +
      "/" +
      factor +
      "/" +
      transverse;
    linkTag.click();
    downloadAlert.classList.add("visible");
    downloadContent.classList.remove("visible");
  });
});

removeDownloadModal.addEventListener("click", function () {
  downloadAlert.classList.remove("visible");
  downloadModel.classList.remove("visible");
});

cancelDownload.addEventListener("click", function () {
  downloadModel.classList.remove("visible");
});
