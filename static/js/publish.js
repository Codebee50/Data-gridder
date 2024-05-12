const browseFile = document.getElementById("browse-file");
const fileName = document.getElementById("file-name");
const cancelFile = document.getElementById("cancel-file");
const fileInput = document.getElementById("file");
const publishForm = document.getElementById("publish-form");

// const tableContainer = document.querySelector('.table-container')
const modalContainer = document.getElementById("modal-container");
const progressContainer = document.getElementById("progress-container");
const resultContainer = document.getElementById("result-container");
const warningContainer = document.getElementById("warning-div");

const showSample = document.getElementById("example-dg-text");
const copyFormToolText = document.getElementById("copy-form-tooltip-text");
const domainInput = document.getElementById("domain");

const fileContainer = document.getElementById("file-container");
const txtFileName = document.getElementById('txt-file-name')
const btnRemoveFile = document.querySelector('.remove-file-container')
const txtInputWordCount = document.getElementById('txt-input-word-count')
const formNameInput = document.querySelector('#form-name')
const inputMaxLength = 60
let formData = JSON.parse(localStorage.getItem("formData"));
let formDataStr = localStorage.getItem("formData");

let prevTable = "<table><thead><tr>";

let headers = Object.values(formData[0]);

formData.forEach(function (data) {
  if (data.datatype == "empty") {
    prevTable += `<th id="empty-header"> </th>`;
  } else {
    prevTable += "<th>" + data.name + "</th>";
  }
});

prevTable += "</tr></thead><tbody>";

for (let i = 0; i < formData.length; i++) {
  prevTable += "<td> - </td>";
}

prevTable += "</table>";

const tablepreview = document.querySelector(".table-preview");
tablepreview.innerHTML = prevTable;

fileContainer.addEventListener("click", function () {
  fileInput.click();
});

formNameInput.addEventListener('input', function(){
    let inputValueLength = formNameInput.value.length
    
    txtInputWordCount.textContent = `${inputValueLength}/${inputMaxLength}`
    if (inputValueLength >= inputMaxLength){
        formNameInput.value = formNameInput.value.slice(0, inputMaxLength);
    }


    
})

fileInput.addEventListener("change", function (e) {
  if (fileInput.files && fileInput.files.length > 0) {
    //this means files were selected
    const selectedFile = fileInput.files[0]
    txtFileName.textContent = selectedFile.name
  }
  else{
    //this means no file was selected 
    txtFileName.textContent = 'No file chosen'
  }
});

btnRemoveFile.addEventListener('click', function(){
    fileInput.value = null
    txtFileName.textContent = 'No file chosen'

})

function handleDrop(event) {
  event.preventDefault();
  let files = event.dataTransfer.files;

  let fileExtension = getFileExtension(files[0].name);
  if (fileExtension !== "doc" || fileExtension !== "docx") {
    alert("Invalid file, try providing a .doc or .docx file ");
  } else {
    fileInput.files = files;
    let name = fileInput.files[0].name;
    fileName.textContent = name;
  }
}

function getFileExtension(filename) {

  let dotIndex = filename.lastIndexOf(".");
  if (dotIndex !== -1 && dotIndex !== filename.length - 1) {
    const extension = filename.substring(dotIndex + 1);
    return extension;
  } else {
    return "-";
  }
}

$(document).on("submit", "#publish-form", function (e) {
  e.preventDefault();
  //showing the progress bar
  modalContainer.classList.add("visible");
  progressContainer.classList.add("visible");
  let formcode = genereateFormCode();

  //preparing the data to be sent
  let mData = new FormData();
  mData.append("form-name", $("#form-name").val());
  mData.append("form_data", formDataStr);
  mData.append("form_code", formcode);
  mData.append("document", fileInput.files[0]);
  mData.append('description', document.getElementById('form-description').value)
  mData.append(
    "csrfmiddlewaretoken",
    $("input[name=csrfmiddlewaretoken]").val()
  );
  warningContainer.classList.remove("visible");

  $.ajax({
    type: "POST",
    url: "/publish",
    data: mData,
    contentType: false,
    processData: false,

    success: function (data) {
      if (data.status == "success") {
        localStorage.setItem("formData", "none");
        warningContainer.classList.remove("visible");
        progressContainer.classList.remove("visible");
        resultContainer.classList.add("visible");

        //removing the modal container on click of the done button
        const btnDone = document.getElementById("btn-done");
        btnDone.addEventListener("click", function () {
          modalContainer.classList.remove("visible");
          window.location.href = "/dashboard";
        });

        const copyCode = document.getElementById("copy-form-code");
        copyCode.addEventListener("click", function () {
          navigator.clipboard
            .writeText(data.formcode)
            .then(() => {

              setTimeout(function () {
              }, 1300);
            })
            .catch((error) => {
              console.error("Fialed to copy text", error);
            });
        });

        const copyLink = document.getElementById('copy-form-link')
        copyLink.addEventListener("click", function () {
          navigator.clipboard
            .writeText(polLink)
            .then(() => {
              //copyLinkTool.textContent = "Copied";
              setTimeout(function () {
                //copyLinkTool.textContent = "Copy form link";
              }, 1300);
            })
            .catch((error) => {
              console.error("Failed to copy text ", error);
            });
        });

        const txtFormCode = document.getElementById("txt-form-code");
        const txtFormLink = document.getElementById("txt-form-link");
        const txtFormName = document.getElementById("txt-form-name");
        const txtFormAuthor = document.getElementById("txt-form-owner");
        let serverLink = `http:${data.domain}/regform/`;
        let polLink = serverLink + data.formcode + "/nb";

        txtFormCode.textContent = data.formcode;
        txtFormName.textContent = data.formname;
        txtFormAuthor.textContent = data.formauthor;
        txtFormLink.textContent = polLink;
      } else {
        resultContainer.classList.remove("visible");
        progressContainer.classList.remove("visible");
        warningContainer.classList.add("visible");
        const warningMessage = document.getElementById("warning-messsage");
        warningMessage.textContent = data.message;

        //removing the modal container on click of the done button
        const btnDone = document.getElementById("warn-done");
        btnDone.addEventListener("click", function () {
          modalContainer.classList.remove("visible");
        });
      }
    },
    error: function (response) {
      //hidding the modal container and the progress container if the query fails
      alert("An error occured please try again");
      progressContainer.classList.remove("visible");
      modalContainer.classList.remove("visible");
    },
  });
});

/** this function generates a form code which will resemble DG-IU9085 */
function genereateFormCode() {
  let randomNumbers = generateRandomNumbers();
  let randomLetters = generateRandomLetters();
  let formCode = `DG-${randomLetters}${randomNumbers}`;
  return formCode;
}

function generateRandomNumbers() {
  /** Math.random generates a random number from 0 to 1, multiplying this random number by 9000 we generate a random number from 0 to 9000
   * 1000 is being added to this number to ensure that the result is between 1000 and 9000
   * flooring it to ensuree the returned number is not decimal
   */
  return Math.floor(1000 + Math.random() * 9000);
}

/** generates two random letters */
function generateRandomLetters() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  //getting a random letters
  const randomLetter1 = letters.charAt(
    Math.floor(Math.random() * letters.length)
  );
  const randomLetter2 = letters.charAt(
    Math.floor(Math.random() * letters.length)
  );
  return randomLetter1 + randomLetter2;
}
