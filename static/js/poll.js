const btnNewField = document.getElementById('btn-new-field')
const fieldContainer = document.querySelector('.field-container')
const radioButtons = document.querySelectorAll('input[name="datatype"]')
const requiredCheck = document.querySelector('#required')
const fieldName = document.querySelector('#field-name')
const saveBtn = document.querySelector('.save-btn')
const deleteBtn = document.getElementById('delete-btn')
const btnAddBelow = document.getElementById('btn-add-below')
const bars = document.querySelectorAll('#bar')
const publishBtn = document.getElementById('publish-btn')

const leftParent = document.querySelector('.leftparent')

const navigations = document.querySelector('.navigations')
const controls = document.querySelectorAll('.navigation')
const sections = document.querySelectorAll('.rightparent')
const pollsUi = document.querySelectorAll('.redirect')
const deletePoll = document.querySelectorAll('.delete-poll')
const btnClear = document.getElementById('btn-clear')

const alertMessage = document.getElementById('cus-alert-message')
const okBtn = document.getElementById('ok-btn')
const cancelBtn = document.getElementById('cancel-btn')
const alertModal = document.querySelector('.modal-container')

const progCheck = document.querySelector('.prog-check')
const spinner = document.getElementById('spinner')
const checkImage= document.getElementById('check')

const deleteModal = document.querySelector('.delete-modal')
const delAlert = document.getElementById('delete-alert-message')
const deleteContent = document.querySelector('.delete-content')
const finishBtn = document.getElementById('finish-btn')
const statusText = document.querySelector('.status-text')

const logOutModal = document.querySelector('.log-out-modal')
const cancelLogOut= document.getElementById('t-cancel-log-out')
const logOut = document.getElementById('t-log-out')
const accordions = document.querySelectorAll('.accordion-body')
const registerdPolls = document.querySelectorAll('.reg-poll')

const deleteEntryModal = document.querySelector('.delete-entry-modal')
const deleteEntryMsg = document.querySelector('.delete-entry-message')
const deleteEntryContent = document.querySelector('.delete-entry-content')
const finishDelEntry = document.getElementById('finish-btn-entry')
const deleteEntryProgress= document.querySelector('.prog-check-entry')

const chooseFileBtn = document.getElementById('choose-file-btn')
const sortFile = document.getElementById('sort-file')
const docTitle = document.querySelector('.doc-title')


class Field{
    constructor(id, name, required, datatype){
        this.id = id
        this.name = name
        this.required = required
        this.datatype = datatype
    }
}

let fieldJson;

//this array stores all the fields objects 
let feildArray = []

let idValue = 0;
let colorIndex = -1;
let fieldObjet;


saveBtn.addEventListener('click', validateFields)
deleteBtn.addEventListener('click', deleteFieldobject)
btnAddBelow.addEventListener('click', createNewField.bind(null, true))

chooseFileBtn.addEventListener('click', function(e){
    sortFile.click()
})



sortFile.addEventListener('change', function(){
    let filename = this.files[0].name
    docTitle.textContent = filename
})

$('document').ready(function(e){
    $.ajax({
        'url': '/getuservalues',
        'type': 'GET',
        success: (response) =>{
            orgarnizeAccordions(response.user_values)
        },
        error: (response) =>{
            console.log(response)
        }
    })
})


document.getElementById('cancel-del-entry').addEventListener('click', function(e){
    deleteEntryModal.classList.remove('visible')
})

const newPollDmark = document.getElementById('scratch-poll')
const fromDocDmark = document.getElementById('from-document')

let pollFromScratch = true
selectPollCreateOption(pollFromScratch)
newPollDmark.addEventListener('click', function(){//this means user wants to crate a poll from scratch
    pollFromScratch = true
    selectPollCreateOption(pollFromScratch)
})

fromDocDmark.addEventListener('click', function(){//this means user wants to create a poll from a document
    pollFromScratch = false
    selectPollCreateOption(pollFromScratch)

})

const btnCreatePoll = document.getElementById('btn-create-poll')
const chooseExistingFlleInput = document.getElementById('choose-ex-file')

btnCreatePoll.addEventListener('click', function(){
    if(pollFromScratch){
        const conNewPoll = document.getElementById('con-new-poll')
        conNewPoll.click()
        transitionModal('none')
    }
    else{
        chooseExistingFlleInput.click()
    }
})

chooseExistingFlleInput.addEventListener('change', function(){
    const loadingMessage = document.querySelector('.loading-text')
    loadingMessage.textContent = 'Scanning document for dg column'

    if (chooseExistingFlleInput.files[0] !== null){
        transitionModal('v2-loading-modal')

        let formData = new FormData()
        formData.append('document', chooseExistingFlleInput.files[0])
        formData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val())
    
        
        fetch('/manager/validate-existing-document/', {
            'method': 'POST',
            'body': formData
        }).then(response => {
            if(!response.ok){
                console.log('something went wrong with the response')
            }
            return response.json()
        })
        .then(data => {
            message = data.message
           
            if(data.statusCode == 200){
                setUpAlertModalOneAction('v2-alert-modal-1a', 'res',message, ()=>{
                    transitionModal('none')
                } , 'Proceed' )
            }
            else{
                setUpAlertModalOneAction('v2-alert-modal-1a', 'res',message, ()=>{
                    transitionModal('none')
                } , 'Ok' )
            }
        })
        .catch(error => {
            console.error('Fetch error', error)
        })
    }
    
})

function selectPollCreateOption(pollFromScratch){
    dmark = document.querySelectorAll('.dmark-content')
    dmark.forEach(function(dmarkContent){
        dmarkContent.classList.remove('selected')
    })
    pollFromScratch? newPollDmark.classList.add('selected'): fromDocDmark.classList.add('selected')
}

function orgarnizeAccordions(values){
    //looping through all the accordions

    accordions.forEach((accordion)=>{
       item = values.find(value => value.id == accordion.id)
 
       let valuesContainer = accordion.querySelector('.field_values_content')
       let deleteEntry = accordion.querySelector('.delete-entry')

        if(deleteEntry !== null){
            deleteEntry.addEventListener('click', function(e){
                entryId = e.target.id
                deleteEntryModal.classList.add('visible')
                deleteEntryContent.classList.add('visible')
                const deleteEntryBtn = document.getElementById('ok-del-entry')
                deleteEntryBtn.addEventListener('click', deleteAnEntry.bind(null,entryId))
            })
        }

       if(item){
         fieldValues = JSON.parse(item.field_values)
      
         fieldValues.forEach((fieldValue)=>{
           
            divEl = `<div class="field">
            <p class="value_name">${fieldValue.name}:</p>
            <p class="value_value">${fieldValue.value}</p>
        </div>`

        
        valuesContainer.innerHTML += divEl
         })
       }
       else{
        console.log('item not found')
       }
    })

    registerdPolls.forEach((poll, index)=>{
        header = poll.querySelector('header')
        const paras = header.querySelectorAll('p')
        paras.forEach((para)=>{
            para.addEventListener('click', function(e){
                e.stopPropagation()
            })
        })

        const hs = header.querySelectorAll('h3')
        hs.forEach((h)=>{
            h.addEventListener('click', function(e){
                e.stopPropagation()
            })
        })

        const is = header.querySelectorAll('i')
        is.forEach((i)=>{
            i.addEventListener('click', function(e){
                e.stopPropagation()
            })
        })

        if(header !== null){
            header.addEventListener('click', function(e){
                
                let accBody = poll.querySelector('.accordion-body')
                poll.classList.toggle('open')
                if(poll.classList.contains('open')){
                    accBody.style.height= `${accBody.scrollHeight}px`
                    e.target.querySelector('.indicator').classList.replace('fa-plus', 'fa-minus')
                }
                else{
                    accBody.style.height = '0px'
                    e.target.querySelector('.indicator').classList.replace('fa-minus', 'fa-plus')

                   
                }

                
            })
        }

        
    })
}

/** this function is used to send a request to the server side which deletes a poll value with the id of entryId */
function deleteAnEntry(entryId){
    deleteEntryContent.classList.remove('visible')
    deleteEntryProgress.classList.add('visible')
    const entrySpinner = document.getElementById('entry-spinner')
    const deleteEntryCheck = document.getElementById('check-entry')
    const deleteEntryStatus= document.querySelector('.status-text-entry')
    finishDelEntry.style.display = 'none'

    entrySpinner.style.display = 'block'
    deleteEntryCheck.style.display = 'none'
    deleteEntryStatus.textContent = 'Deleting your entry...'

    finishDelEntry.addEventListener('click', ()=>{
        location.reload()
    })


    $.ajax({
        url: '/delentry/' + entryId + '/',
        type: 'GET',
        success: function(response){
            deleteEntryStatus.textContent = response.message
            finishDelEntry.style.display = 'block'
           if(response.status == 'failed'){
                //query was successful but with an error
                entrySpinner.style.display = 'none'
                deleteEntryCheck.style.display = 'none'
           }
           else{
                //query was successful
                entrySpinner.style.display= 'none'
                deleteEntryCheck.style.display = 'block'

           }
        },
        error: function(response){
            //query was not successful
            alert(response)
            console.log(response)
            location.reload()

        }
        
    })


}

publishBtn.addEventListener('click', (event)=>{
    event.preventDefault()
    let emptycount = 0;
    feildArray.forEach(function(field){
        if(field.datatype == 'empty'){
            emptycount += emptycount+1 
        }
    })

    if(emptycount == feildArray.length){
        alert('Cannot publish an empty poll')
    }
    else{
        console.log(emptycount)
        fieldJson = JSON.stringify(feildArray)
        console.log(fieldJson)
        localStorage.setItem('pollData', fieldJson)
        window.location.href = '/publish'
        
    }

})

bars.forEach((bar)=>{
    bar.addEventListener('click', ()=>{
        let list = Array.from(leftParent.classList)
        if(list.includes('active')){
            //this means the left parent is open and we want to close it 
            leftParent.classList.remove('active')

            bar.className = " "
            bar.classList.add('fa-solid')
            bar.classList.add('fa-bars')
        }
        else{
            //this means the leftparent is closed and we want to open it 
            leftParent.classList.add("active")

            bar.className= " "
            bar.classList.add('fas')
            bar.classList.add('fa-times')
        }
        
    })
})

pollsUi.forEach(function(poll){
    poll.addEventListener('click', function(e){
        let pollcode = e.target.id
        window.location.href = '/viewpoll/' + pollcode + '/'
    })
})

deletePoll.forEach(function(deleteItem){
    deleteItem.addEventListener('click', function(e){
        let pollcode = e.target.id
        
        deleteModal.classList.add('visible')
        deleteContent.classList.add('visible')
        const delteBtn = document.getElementById('ok-del')
        const cancelBtn = document.getElementById('cancel-del')
       

        delAlert.textContent = 'Sure to delete ' + pollcode + '?'

        delteBtn.addEventListener('click', function(){
         deleteContent.classList.remove('visible')
         progCheck.classList.add('visible')
         checkImage.style.display = 'none'
         spinner.style.display = 'block' 
         finishBtn.style.display= 'none'
         
        removePoll(pollcode)
        })

        cancelBtn.addEventListener('click', function(){
            deleteContent.classList.remove('visible')
            deleteModal.classList.remove('visible')
        })
    })
})

//this function is used to delete the poll from the serverside 
function removePoll(pollcode){
    $.ajax({
        url: '/deletepoll/' + pollcode + '/',
        type: 'GET',
        success: function(response){
            statusText.textContent = response.message
            finishBtn.style.display = 'block'
           if(response.status == 'success'){
                //poll has been deleted
                spinner.style.display= 'none'
                checkImage.style.display = 'block'
           }
           else{
                spinner.style.display = 'none'
           }

           finishBtn.addEventListener('click', function(){
                location.reload()
           })
        },
        error: function(response){
            return response
        }
    })
}

function pageTransitions(){
    for(let i =0; i<controls.length; i++){
        controls[i].addEventListener('click', function(){
            if(this.id != 'con-log-out'){
                //remove the class name of active-btn from all the navigations and add it to the clicked one
                let currentBtn = document.querySelectorAll('.active-btn')
                currentBtn[0].className = currentBtn[0].className.replace('active-btn', '')

                //----v2 properties----
                // if(this.id == 'con-new-poll'){
                //     const newPoll = document.getElementById('con-scratch-poll')
                //     newPoll.className += ' active-btn'
                // }
                // else{
                //     this.className += ' active-btn'
                // }

                this.className += ' active-btn'

            }
            
        })
    }

    navigations.addEventListener('click', (e)=>{
        const id = e.target.dataset.id
        if(id){
        
            if(id == 'log-out'){
                logOutModal.classList.add('visible')
            }
            else if(id == 'contact-us'){
                window.location.href = '/#contact-us-section'
            }
            else if(id == 'scratch-poll'){
                transitionModal('choose-create-option-modal')
            }
            else{
               sections.forEach((section)=>{
                section.classList.remove('active-screen')
                localStorage.setItem('screen-id', id)
            })
            const element = document.getElementById(id)
            element.classList.add('active-screen')
      
            }

            
            let screenwidth = window.innerWidth
            if(screenwidth <= 950){
                //this means we are in mobile mode 
                bars.forEach((bar)=>{
                    leftParent.classList.remove('active')
                    bar.className = " "
                    bar.classList.add('fa-solid')
                    bar.classList.add('fa-bars')
                
                })
            }
            
        }
    })
    
}

cancelLogOut.addEventListener('click', function(){
    logOutModal.classList.remove('visible')
})

function localTransitions(){
    let screen = localStorage.getItem('screen-id')
 
    if (screen !== null){
       
    }
    else{
        screen = 'new-poll'
    }

    let id = 'con-' + screen
    let currentControl = document.getElementById(id)
    controls.forEach(function(control){
        control.classList.remove('active-btn')
    })
    currentControl.classList.add('active-btn')


    let currentScreen = document.getElementById(screen)
    sections.forEach(function(section){
        section.classList.remove('active-screen')
    })
    
    currentScreen.classList.add('active-screen')

}


pageTransitions()
localTransitions()

let isValidJsonArray = /^\[\{.*\}\]$/.test(localStorage.getItem('pollData'));

if(isValidJsonArray){
    loadLocalDataIntoView()   
}
else{
    createNewField(false)
}



initListeners()
function loadLocalDataIntoView(){
    feildArray = JSON.parse(localStorage.getItem('pollData'))
    lastId = 0;
    index = 1;
    feildArray.forEach(obj => {
        fieldElement = document.createElement("div")
        lastId = obj.id
        fieldElement.id = obj.id
        let pId = 'p' + obj.id
        let p = '<p id=' + pId + '> ' + obj.name + '</p' 
        fieldElement.innerHTML = p
        fieldElement.classList.add('field')
    
        fieldElement.addEventListener('click', selectField)
        fieldContainer.appendChild(fieldElement)
        if(index == 1){
            const syntheticEvent = {
                target: fieldElement,
            };
            selectField(syntheticEvent)
        }
        index ++ 
    })

    idValue = lastId
}

function initListeners(){
    
    radioButtons.forEach(radiobutton => {
        radiobutton.addEventListener('change', validateFields)
    })

    fieldName.addEventListener('change', validateFields)
    btnClear.addEventListener('click', clear)

    requiredCheck.addEventListener('change', validateFields)
}


btnNewField.addEventListener('click', createNewField.bind(null, false))

/** the below parameter is used to indicate if the new div is to be added below the currently selected element or 
 * if a new div is to be created at the end of the container
 */
function createNewField(below){
    //creating a new feild element
    fieldElement = document.createElement("div")
    idValue ++
    fieldElement.id = idValue
    let pId = 'p' +idValue
    let p = '<p id=' + pId + '>Blank</p' 

    fieldElement.innerHTML = p
    fieldElement.classList.add('field')
    
    fieldElement.addEventListener('click', selectField)

    //creating a new field object that corresponds to this field element with default values
    feildObject = new Field(idValue, 'Blank', false, 'text')
    
    if(below){
        let selected = document.getElementById(fieldObjet.id + '')

        //getting the index of the currently selected field in the field array so that the new element can be inserted below it
        //this is done so that the order of the field items in the list can be the same way the user ordered them 
        let fieldIndex = feildArray.findIndex(field => field.id == fieldObjet.id +'')
        feildArray.splice(fieldIndex+1,0,  feildObject)
        fieldContainer.insertBefore(fieldElement, selected.nextSibling)
    }
    else{
        //in this case just append the new field to the end of the field container and to the end of the list 
        fieldContainer.appendChild(fieldElement)
        feildArray.push(feildObject)
    }

    if(feildArray.length <2 ){
        // Create a synthetic event object
        const syntheticEvent = {
            target: fieldElement,
        };
        selectField(syntheticEvent)
    }



 
}

/** selects the passed field */
function selectField(e){
    //checking if the user clicked on a field 
    if(Array.from(e.target.classList).includes('field')){
        let fields = document.querySelectorAll('.field')
        //removing the selected class name from all fields
        fields.forEach(field => {
            field.classList.remove('selected')
        })
    
    
        //setting the selected class name to only the selected field
        e.target.classList.add('selected')
        
    
        //getting the filed object of the selected field
        feildArray.forEach(f => {
            if(f.id == e.target.id){
                fieldObjet = f
            }
        })
    
      
      for (let i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].value === fieldObjet.datatype) {
          radioButtons[i].checked = true
          break
        }
      }
     
    //   console.log(fieldObjet)
      
      requiredCheck.checked = fieldObjet.required
        fieldName.value = fieldObjet.name

    }
     
}

/** ensuring there are no errors in the fields before saving them */
function validateFields(){
    if(fieldName.value == ''){
        for(let i=0; i< radioButtons.length; i++){
            if (radioButtons[i].checked == true){
                if(radioButtons[i].value !== 'empty'){
                    alertModal.classList.add('visible')
                    alertMessage.textContent = 'Its not advisible to have empty names for non empty fields'
                    okBtn.classList.add('visible')
                    cancelBtn.classList.add('visible')

                    okBtn.textContent = 'Continue'
                    okBtn.style.background = '#ff0000'

                    okBtn.addEventListener('click', function(){
                        fieldObjet.name = '-'
                        alertModal.classList.remove('visible')
                        saveFields()
                        
                    })
                  
                    cancelBtn.addEventListener('click', function(){
                        alertModal.classList.remove('visible')
                    })
                }
                else{
                    fieldObjet.name = '-'
                    saveFields()
                }
            }
        }
    }
    else{
        fieldObjet.name = fieldName.value
        saveFields()
        
    }

   
}

function saveFields(){
    fieldObjet.required = requiredCheck.checked
    
    for (let i = 0; i < radioButtons.length; i++) {
        if(radioButtons[i].checked == true){
            fieldObjet.datatype = radioButtons[i].value
            break
            }
    }
    
    let fieldIndex = feildArray.findIndex(field => field.id == fieldObjet.id +'')

    let p = document.getElementById('p' + fieldObjet.id)
    p.textContent = fieldObjet.name
    if(fieldIndex !== -1){
        feildArray[fieldIndex] = fieldObjet
    }
}

function deleteFieldobject(){
    let fieldUi = document.getElementById(fieldObjet.id + '')
     if(feildArray.length > 1){
        fieldUi.remove()
        let fieldIndex = feildArray.findIndex(field => field.id == fieldObjet.id +'')
        let pInd = fieldIndex -1
        if (pInd == -1){
            pInd = fieldIndex +1
        }
        if(pInd > feildArray.length){
            pInd = fieldIndex
        }
        fieldObjet = feildArray[pInd]
        
        let newFieldElement = document.getElementById(fieldObjet.id + '')
        const syntheticEvent = {
            target: newFieldElement,
        };
       selectField(syntheticEvent)

        feildArray.splice(fieldIndex, 1)
    }
    else{
        alert('Cannot delete this field')
    }
    
}


function clear(){
    console.log('clearing')
    feildArray.forEach(fieldElement => {
        let fieldUi = document.getElementById(fieldElement.id + '')
        fieldUi.remove()
    })
    //splice is used to delete from starting index to ending index in the list
    feildArray.splice(0, feildArray.length)
    idValue = 0
    createNewField(false)
}






