const btnNewField = document.getElementById("btn-new-field");
const fieldContainer = document.querySelector(".field-container");
const radioButtons = document.querySelectorAll('input[name="datatype"]');
const requiredCheck = document.querySelector("#required");
const fieldName = document.querySelector("#field-name");
const saveBtn = document.querySelector(".save-btn");
const deleteBtn = document.getElementById("delete-btn");
const btnAddBelow = document.getElementById("btn-add-below");
const bars = document.querySelectorAll("#bar");
const publishBtn = document.getElementById("publish-btn");

const leftParent = document.querySelector(".leftparent");

const navigations = document.querySelector(".navigations");
const controls = document.querySelectorAll(".navigation");
const sections = document.querySelectorAll(".rightparent");
const formsUi = document.querySelectorAll(".redirect");
const deleteForm = document.querySelectorAll(".delete-form");
const btnClear = document.getElementById("btn-clear");

const alertMessage = document.getElementById("cus-alert-message");
const okBtn = document.getElementById("ok-btn");
const cancelBtn = document.getElementById("cancel-btn");
const alertModal = document.querySelector(".modal-container");

const progCheck = document.querySelector(".prog-check");
const spinner = document.getElementById("spinner");
const checkImage = document.getElementById("check");

const deleteModal = document.querySelector(".delete-modal");
const delAlert = document.getElementById("delete-alert-message");
const deleteContent = document.querySelector(".delete-content");
const finishBtn = document.getElementById("finish-btn");
const statusText = document.querySelector(".status-text");

const logOutModal = document.querySelector(".log-out-modal");
const cancelLogOut = document.getElementById("t-cancel-log-out");
const logOut = document.getElementById("t-log-out");
const accordions = document.querySelectorAll(".accordion-body");
const registerdForms = document.querySelectorAll(".reg-form");

const deleteEntryModal = document.querySelector(".delete-entry-modal");
const deleteEntryMsg = document.querySelector(".delete-entry-message");
const deleteEntryContent = document.querySelector(".delete-entry-content");
const finishDelEntry = document.getElementById("finish-btn-entry");
const deleteEntryProgress = document.querySelector(".prog-check-entry");

const chooseFileBtn = document.getElementById("choose-file-btn");
const sortFile = document.getElementById("sort-file");
const docTitle = document.querySelector(".doc-title");

const justDeleted = localStorage.getItem("just-deleted");
if (justDeleted) {
  showToast({ style: "success", message: justDeleted, duration: 2000 });
  localStorage.removeItem("just-deleted");
}
class Field {
  constructor(id, name, required, datatype) {
    this.id = id;
    this.name = name;
    this.required = required;
    this.datatype = datatype;
  }
}

let fieldJson;

//this array stores all the fields objects
let feildArray = [];

let idValue = 0;
let colorIndex = -1;
let fieldObjet;
const userValueList = [];

saveBtn.addEventListener("click", validateFields);
deleteBtn.addEventListener("click", deleteFieldobject);
btnAddBelow.addEventListener("click", createNewField.bind(null, true));

chooseFileBtn.addEventListener("click", function (e) {
  sortFile.click();
});

sortFile.addEventListener("change", function () {
  let filename = this.files[0].name;
  docTitle.textContent = filename;
});

function populateTablesUi(forms) {
  forms.forEach(function (form) {
    const tableContainer = document.getElementById(`table-con-${form.id}`); //getting the corresponding table container for this form
    tableContainer.innerHTML = "";
    const table = getCardTable(JSON.parse(form.fields));
    tableContainer.insertAdjacentHTML("afterbegin", table);

    document.getElementById(
      `pb-date-${form.id}`
    ).textContent = `Published ${getIntlDate(new Date(form.created_at))}`;
  });
}

function populateRegisteredValuesTables(userValues) {
  userValues.forEach(function (userValue) {
    const fieldValue = userValue.field_values;
    const regTableContainer = document.getElementById(
      `value-table-con-${userValue.id}`
    );
    if (regTableContainer) {
      regTableContainer.innerHTML = "";
      const table = getCardTable(JSON.parse(fieldValue));
      regTableContainer.insertAdjacentHTML("afterbegin", table);
    }

    document.getElementById(
      `reg-date-${userValue.id}`
    ).textContent = `Registered ${getIntlDate(
      new Date(userValue.registered_date)
    )}`;
    userValueList.push(userValue);
  });

}

function getIntlDate(date) {
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  };

  const locale = navigator.language;

  return new Intl.DateTimeFormat(locale, options).format(date);
}

function getCardTable(form) {
  let table = `<table><tbody>`; //opening the table tag
  form.forEach(function (field) {
    //populating the table with table rows
    table += `<tr>
                  <td>${field.name}</td>
              </tr>`;
  });

  table += `</tbody></table>`; //closing the table tag
  return table;
}

function displayReviewCard(valueId) {
  const userValue = userValueList.find((userValue) => userValue.id === Number(valueId));
  if (userValue) {
    //this means the uservalue actually exists
    document.getElementById(
      "rev-values-message"
    ).innerHTML = `Your responses for <b> ${
      userValue.form_name
    } </b> on ${getIntlDate(new Date(userValue.registered_date))}`;
    const valuesContainer = document.getElementById("values-container");
    valuesContainer.innerHTML = "";

    JSON.parse(userValue.field_values).forEach(function (fieldValue) {

      const html = ` <div class="value">
          <h4>${fieldValue.name}:</h4>
          <p>${fieldValue.value === ''? "No response": fieldValue.value}</p>
      </div>`;
      valuesContainer.innerHTML += html
    });

    document.getElementById('link-to-edit-a').href = `/regform/${userValue.form_code}/${userValue.id}/`
    document.getElementById('delete-value-btn').onclick = function(){
      showAlertModalTwoAction({
        maintext: 'Are you sure to delete this entry?',
        subtext: 'All records you have provided for this form will be deleted. This action is irreversible!.',
        onAction: function(){
          deleteFormValue(userValue.id)
        },
        actiontext: 'Delete',
        
      })
    }
    transitionModal('rev-values-modal')
  }
}


document.addEventListener("DOMContentLoaded", function () {
  fetch("/getuserforms", {
    //Getting all the forms this person has created
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      populateTablesUi(data.forms);
    })
    .catch((error) => {
      console.error(error);
    });

  fetch("/getuservalues", {
    //getting the values for all the forms this person has registered for
    method: "GET",
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // orgarnizeAccordions(data.user_values);
      populateRegisteredValuesTables(data.user_values);
    })
    .catch((error) => {
      console.error(error);
    });
});

function parseJsonString(parseString) {
  parsed = JSON.parse(parseString);
  return parsed;
}

document
  .getElementById("cancel-del-entry")
  .addEventListener("click", function (e) {
    deleteEntryModal.classList.remove("visible");
  });

const newFormDmark = document.getElementById("scratch-form");
const fromDocDmark = document.getElementById("from-document");

let formFromScratch = true;
selectFormCreateOption(formFromScratch);
newFormDmark.addEventListener("click", function () {
  //this means user wants to crate a form from scratch
  formFromScratch = true;
  selectFormCreateOption(formFromScratch);
});

fromDocDmark.addEventListener("click", function () {
  //this means user wants to create a form from a document
  formFromScratch = false;
  selectFormCreateOption(formFromScratch);
});

const btnCreateForm = document.getElementById("btn-create-form");
const chooseExistingFlleInput = document.getElementById("choose-ex-file");

btnCreateForm.addEventListener("click", function () {
  if (formFromScratch) {
    const conNewForm = document.getElementById("con-new-form");
    conNewForm.click();
    transitionModal("none");
  } else {
    chooseExistingFlleInput.click();
  }
});

chooseExistingFlleInput.addEventListener("change", function () {
  const loadingMessage = document.querySelector(".loading-text");
  loadingMessage.textContent = "Scanning document for dg column";

  if (chooseExistingFlleInput.files[0] !== null) {
    transitionModal("v2-loading-modal");

    let formData = new FormData();
    formData.append("document", chooseExistingFlleInput.files[0]);
    formData.append(
      "csrfmiddlewaretoken",
      $("input[name=csrfmiddlewaretoken]").val()
    );

    fetch("/manager/validate-existing-document/", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          console.error("something went wrong with the response");
        }
        return response.json();
      })
      .then((data) => {
        message = data.message;

        if (data.statusCode == 200) {
          setUpAlertModalOneAction(
            "v2-alert-modal-1a",
            "res",
            message,
            () => {
              transitionModal("none");
            },
            "Proceed"
          );
        } else {
          setUpAlertModalOneAction(
            "v2-alert-modal-1a",
            "res",
            message,
            () => {
              transitionModal("none");
            },
            "Ok"
          );
        }
      })
      .catch((error) => {
        console.error("Fetch error", error);
      });
  }
});

function selectFormCreateOption(formFromScratch) {
  dmark = document.querySelectorAll(".dmark-content");
  dmark.forEach(function (dmarkContent) {
    dmarkContent.classList.remove("selected");
  });
  formFromScratch
    ? newFormDmark.classList.add("selected")
    : fromDocDmark.classList.add("selected");
}

function orgarnizeAccordions(values) {
  //looping through all the accordions

  accordions.forEach((accordion) => {
    item = values.find((value) => value.id == accordion.id);

    let valuesContainer = accordion.querySelector(".field_values_content");
    let deleteEntry = accordion.querySelector(".delete-entry");

    if (deleteEntry !== null) {
      deleteEntry.addEventListener("click", function (e) {
        entryId = e.target.id;
        deleteEntryModal.classList.add("visible");
        deleteEntryContent.classList.add("visible");
        const deleteEntryBtn = document.getElementById("ok-del-entry");
        deleteEntryBtn.addEventListener(
          "click",
          deleteAnEntry.bind(null, entryId)
        );
      });
    }

    if (item) {
      fieldValues = JSON.parse(item.field_values);

      fieldValues.forEach((fieldValue) => {
        divEl = `<div class="field">
            <p class="value_name">${fieldValue.name}:</p>
            <p class="value_value">${fieldValue.value}</p>
        </div>`;

        valuesContainer.innerHTML += divEl;
      });
    } else {
      //item not found
    }
  });

  registerdForms.forEach((form, index) => {
    header = form.querySelector("header");
    const paras = header.querySelectorAll("p");
    paras.forEach((para) => {
      para.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    });

    const hs = header.querySelectorAll("h3");
    hs.forEach((h) => {
      h.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    });

    const is = header.querySelectorAll("i");
    is.forEach((i) => {
      i.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    });

    if (header !== null) {
      header.addEventListener("click", function (e) {
        let accBody = form.querySelector(".accordion-body");
        form.classList.toggle("open");
        if (form.classList.contains("open")) {
          accBody.style.height = `${accBody.scrollHeight}px`;
          e.target
            .querySelector(".indicator")
            .classList.replace("fa-plus", "fa-minus");
        } else {
          accBody.style.height = "0px";
          e.target
            .querySelector(".indicator")
            .classList.replace("fa-minus", "fa-plus");
        }
      });
    }
  });
}

function deleteFormValue(id){
  fetch(`/delentry/${id}/`, {
    method: 'GET',
  })
  .then(response=> response.json())
  .then(data => {
    showToast({
      message: data.message,
      duration: 3000,
      style: data.statuscode === 200? 'success': 'falied',
      onfinshed: function(){
        window.location.reload()
      }
    })
  })
  .catch(error => {
    console.error(error)
  })
  
}

/** this function is used to send a request to the server side which deletes a form value with the id of entryId */
function deleteAnEntry(entryId) {
  deleteEntryContent.classList.remove("visible");
  deleteEntryProgress.classList.add("visible");
  const entrySpinner = document.getElementById("entry-spinner");
  const deleteEntryCheck = document.getElementById("check-entry");
  const deleteEntryStatus = document.querySelector(".status-text-entry");
  finishDelEntry.style.display = "none";

  entrySpinner.style.display = "block";
  deleteEntryCheck.style.display = "none";
  deleteEntryStatus.textContent = "Deleting your entry...";

  finishDelEntry.addEventListener("click", () => {
    location.reload();
  });

  $.ajax({
    url: "/delentry/" + entryId + "/",
    type: "GET",
    success: function (response) {
      deleteEntryStatus.textContent = response.message;
      finishDelEntry.style.display = "block";
      if (response.status == "failed") {
        //query was successful but with an error
        entrySpinner.style.display = "none";
        deleteEntryCheck.style.display = "none";
      } else {
        //query was successful
        entrySpinner.style.display = "none";
        deleteEntryCheck.style.display = "block";
      }
    },
    error: function (response) {
      //query was not successful
      alert(response);
      location.reload();
    },
  });
}

publishBtn.addEventListener("click", (event) => {
  event.preventDefault();
  let emptycount = 0;
  feildArray.forEach(function (field) {
    if (field.datatype == "empty") {
      emptycount += emptycount + 1;
    }
  });

  if (emptycount == feildArray.length) {
    alert("Cannot publish an empty form");
  } else {
    fieldJson = JSON.stringify(feildArray);
    localStorage.setItem("formData", fieldJson);
    window.location.href = "/publish";
  }
});

bars.forEach((bar) => {
  bar.addEventListener("click", () => {
    let list = Array.from(leftParent.classList);
    if (list.includes("active")) {
      //this means the left parent is open and we want to close it
      leftParent.classList.remove("active");

      bar.className = " ";
      bar.classList.add("fa-solid");
      bar.classList.add("fa-bars");
    } else {
      //this means the leftparent is closed and we want to open it
      leftParent.classList.add("active");

      bar.className = " ";
      bar.classList.add("fas");
      bar.classList.add("fa-times");
    }
  });
});

function closeLeftParent() {
  leftParent.classList.remove("active");
}

formsUi.forEach(function (form) {
  form.addEventListener("click", function (e) {
    let formcode = e.target.id;
    window.location.href = "/viewform/" + formcode + "/";
  });
});

deleteForm.forEach(function (deleteItem) {
  deleteItem.addEventListener("click", function (e) {
    let formcode = e.target.id;

    deleteModal.classList.add("visible");
    deleteContent.classList.add("visible");
    const delteBtn = document.getElementById("ok-del");
    const cancelBtn = document.getElementById("cancel-del");

    delAlert.textContent = "Sure to delete " + formcode + "?";

    delteBtn.addEventListener("click", function () {
      deleteContent.classList.remove("visible");
      progCheck.classList.add("visible");
      checkImage.style.display = "none";
      spinner.style.display = "block";
      finishBtn.style.display = "none";

      removeForm(formcode);
    });

    cancelBtn.addEventListener("click", function () {
      deleteContent.classList.remove("visible");
      deleteModal.classList.remove("visible");
    });
  });
});

//this function is used to delete the form from the serverside
function removeForm(formcode) {
  $.ajax({
    url: "/deleteform/" + formcode + "/",
    type: "GET",
    success: function (response) {
      statusText.textContent = response.message;
      finishBtn.style.display = "block";
      if (response.status == "success") {
        //form has been deleted
        spinner.style.display = "none";
        checkImage.style.display = "block";
      } else {
        spinner.style.display = "none";
      }

      finishBtn.addEventListener("click", function () {
        location.reload();
      });
    },
    error: function (response) {
      return response;
    },
  });
}

function pageTransitions() {
  for (let i = 0; i < controls.length; i++) {
    controls[i].addEventListener("click", function () {
      if (this.id != "con-log-out") {
        //remove the class name of active-btn from all the navigations and add it to the clicked one
        let currentBtn = document.querySelectorAll(".active-btn");
        currentBtn[0].className = currentBtn[0].className.replace(
          "active-btn",
          ""
        );

        this.className += " active-btn";
      }
    });
  }

  navigations.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (id) {
      if (id == "log-out") {
        logOutModal.classList.add("visible");
      } else if (id == "contact-us") {
        window.location.href = "/#contact-us-section";
      } else if (id == "scratch-form") {
        transitionModal("choose-create-option-modal");
      } else {
        sections.forEach((section) => {
          section.classList.remove("active-screen");
          localStorage.setItem("screen-id", id);
        });
        const element = document.getElementById(id);
        element.classList.add("active-screen");
      }

      let screenwidth = window.innerWidth;
      if (screenwidth <= 950) {
        //this means we are in mobile mode
        bars.forEach((bar) => {
          leftParent.classList.remove("active");
          bar.className = " ";
          bar.classList.add("fa-solid");
          bar.classList.add("fa-bars");
        });
      }
    }
  });
}

cancelLogOut.addEventListener("click", function () {
  logOutModal.classList.remove("visible");
});

function localTransitions() {
  let screen = localStorage.getItem("screen-id");

  if (screen !== null) {
  } else {
    screen = "new-form";
  }

  let id = "con-" + screen;
  let currentControl = document.getElementById(id);
  if (currentControl !== null) {
    controls.forEach(function (control) {
      control.classList.remove("active-btn");
    });
    currentControl.classList.add("active-btn");
  }

  let currentScreen = document.getElementById(screen);

  if (currentScreen !== null) {
    sections.forEach(function (section) {
      section.classList.remove("active-screen");
    });

    currentScreen.classList.add("active-screen");
  }
}

pageTransitions();
localTransitions();

let isValidJsonArray = /^\[\{.*\}\]$/.test(localStorage.getItem("formData"));

if (isValidJsonArray) {
  loadLocalDataIntoView();
} else {
  createNewField(false);
}

initListeners();
function loadLocalDataIntoView() {
  feildArray = JSON.parse(localStorage.getItem("formData"));
  lastId = 0;
  index = 1;

  feildArray.forEach((obj) => {
    fieldElement = document.createElement("div");
    lastId = obj.id;
    fieldElement.id = obj.id;
    let pId = "p" + obj.id;
    let p = "<p id=" + pId + "> " + obj.name + "</p";
    fieldElement.innerHTML = p;
    fieldElement.classList.add("field");

    fieldElement.addEventListener("click", selectField);
    fieldContainer.appendChild(fieldElement);
    if (index == 1) {
      const syntheticEvent = {
        target: fieldElement,
      };
      selectField(syntheticEvent);
    }
    index++;
  });

  idValue = lastId;
}

function initListeners() {
  radioButtons.forEach((radiobutton) => {
    radiobutton.addEventListener("change", validateFields);
  });

  fieldName.addEventListener("change", validateFields);
  btnClear.addEventListener("click", clear);

  requiredCheck.addEventListener("change", validateFields);
}

btnNewField.addEventListener("click", createNewField.bind(null, false));

/** the below parameter is used to indicate if the new div is to be added below the currently selected element or
 * if a new div is to be created at the end of the container
 */
function createNewField(below) {
  //creating a new feild element
  fieldElement = document.createElement("div");
  idValue++;
  fieldElement.id = idValue;
  let pId = "p" + idValue;
  let p = "<p id=" + pId + ">Blank</p";

  fieldElement.innerHTML = p;
  fieldElement.classList.add("field");

  fieldElement.addEventListener("click", selectField);

  //creating a new field object that corresponds to this field element with default values
  feildObject = new Field(idValue, "Blank", false, "text");

  if (below) {
    let selected = document.getElementById(fieldObjet.id + "");

    //getting the index of the currently selected field in the field array so that the new element can be inserted below it
    //this is done so that the order of the field items in the list can be the same way the user ordered them
    let fieldIndex = feildArray.findIndex(
      (field) => field.id == fieldObjet.id + ""
    );
    feildArray.splice(fieldIndex + 1, 0, feildObject);
    fieldContainer.insertBefore(fieldElement, selected.nextSibling);
  } else {
    //in this case just append the new field to the end of the field container and to the end of the list
    fieldContainer.appendChild(fieldElement);
    feildArray.push(feildObject);
  }

  if (feildArray.length < 2) {
    // Create a synthetic event object
    const syntheticEvent = {
      target: fieldElement,
    };
    selectField(syntheticEvent);
  }
}

/** selects the passed field */
function selectField(e) {
  //checking if the user clicked on a field
  if (Array.from(e.target.classList).includes("field")) {
    let fields = document.querySelectorAll(".field");
    //removing the selected class name from all fields
    fields.forEach((field) => {
      field.classList.remove("selected");
    });

    //setting the selected class name to only the selected field
    e.target.classList.add("selected");

    //getting the filed object of the selected field
    feildArray.forEach((f) => {
      if (f.id == e.target.id) {
        fieldObjet = f;
      }
    });

    for (let i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].value === fieldObjet.datatype) {
        radioButtons[i].checked = true;
        break;
      }
    }

    requiredCheck.checked = fieldObjet.required;
    fieldName.value = fieldObjet.name;
  }
}

/** ensuring there are no errors in the fields before saving them */
function validateFields() {
  if (fieldName.value == "") {
    for (let i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked == true) {
        if (radioButtons[i].value !== "empty") {
          alertModal.classList.add("visible");
          alertMessage.textContent =
            "Its not advisible to have empty names for non empty fields";
          okBtn.classList.add("visible");
          cancelBtn.classList.add("visible");

          okBtn.textContent = "Continue";
          okBtn.style.background = "#ff0000";

          okBtn.addEventListener("click", function () {
            fieldObjet.name = "-";
            alertModal.classList.remove("visible");
            saveFields();
          });

          cancelBtn.addEventListener("click", function () {
            alertModal.classList.remove("visible");
          });
        } else {
          fieldObjet.name = "-";
          saveFields();
        }
      }
    }
  } else {
    fieldObjet.name = fieldName.value;
    saveFields();
  }
}

function saveFields() {
  fieldObjet.required = requiredCheck.checked;

  for (let i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked == true) {
      fieldObjet.datatype = radioButtons[i].value;
      break;
    }
  }

  let fieldIndex = feildArray.findIndex(
    (field) => field.id == fieldObjet.id + ""
  );

  let p = document.getElementById("p" + fieldObjet.id);
  p.textContent = fieldObjet.name;
  if (fieldIndex !== -1) {
    feildArray[fieldIndex] = fieldObjet;
  }
}

function deleteFieldobject() {
  let fieldUi = document.getElementById(fieldObjet.id + "");
  if (feildArray.length > 1) {
    fieldUi.remove();
    let fieldIndex = feildArray.findIndex(
      (field) => field.id == fieldObjet.id + ""
    );
    let pInd = fieldIndex - 1;
    if (pInd == -1) {
      pInd = fieldIndex + 1;
    }
    if (pInd > feildArray.length) {
      pInd = fieldIndex;
    }
    fieldObjet = feildArray[pInd];

    let newFieldElement = document.getElementById(fieldObjet.id + "");
    const syntheticEvent = {
      target: newFieldElement,
    };
    selectField(syntheticEvent);

    feildArray.splice(fieldIndex, 1);
  } else {
    alert("Cannot delete this field");
  }
}

function clear() {
  feildArray.forEach((fieldElement) => {
    let fieldUi = document.getElementById(fieldElement.id + "");
    fieldUi.remove();
  });
  //splice is used to delete from starting index to ending index in the list
  feildArray.splice(0, feildArray.length);
  idValue = 0;
  createNewField(false);
}
