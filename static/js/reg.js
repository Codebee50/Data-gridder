const mInput = document.getElementById('in-poll-code')
let inputContainer = document.querySelector('.input-container')
let submit = document.getElementById('submit')
const modalContainer = document.querySelector('.modal-container')
let valueIdInput = document.getElementById('value_id')

const promptTxt = document.getElementById('prompt')
const btnSubmit = document.getElementById('submit')


const messageModal = document.querySelector('.message-modal')
const checkMark= document.getElementById('check-mark')
const errorMark = document.getElementById('error-mark')
const removeMessgeModel = document.getElementById('remove-message-modal')
const txtMessage = document.getElementById('txt-message')

const progressBar = document.getElementById('progress-bar')

if (removeMessgeModel !== null){
    removeMessgeModel.addEventListener('click', function(){
        messageModal.classList.remove('visible')
        location.reload()
    })
}


let vlaueId = valueIdInput.value
let pollvalues

//editmode signifies if a user wants to register for a poll or edit the entries they provided for the poll priviously
let editMode = false



class Input{
    constructor (name, value){
        this.name = name
        this.value = value
    }
}

if(vlaueId !== 'nb'){
    //this means user is trying to edit a field 
}

let pollcode = $('#in-poll-code').val()

if (pollcode !== 'none'){
    modalContainer.classList.remove('visible')
    let inputArray = []
    let inputValueArray = []

$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: '/getpoll/' + pollcode + '/' + vlaueId + '/',
        success: function(data){
            let fieldArray = JSON.parse(JSON.parse(data.fields))
          
            if(data.values !== 'empty'){
                //user wants to edit their entries 
                editMode = true
                pollvalues = JSON.parse(JSON.parse(data.values)[0].fields.field_values)
                
                //fieldArray.forEach(populateUi)
                populateUi(fieldArray)
                promptTxt.textContent = 'Modify your entries'
                btnSubmit.value = 'Save'

            }
            else{
                //a user just wants to register for a poll 
                editMode = false
                populateUi(fieldArray)
                pollvalues = 'empty'
            }
           
        },
        error: function(data){
            console.log(data)
        }
    })
})

$(document).on('submit', '#submit-form', function(e){
    progressBar.classList.add('visible')
    submit.disabled = true
    e.preventDefault()
    inputArray.forEach(function(item){
        //creating a new input object and addding it to the input value array
        //this array would be stringified and stored in the database as the field_values of a PollValue
        let inputMap = new Input(item.name, item.value)
        inputValueArray.push(inputMap)
        
    })

    //stringifying the inputvaluearray
    let inputString = JSON.stringify(inputValueArray)
    
    $.ajax({
        type: 'POST',
        url: '/savevalue',
        data:{
            'pollcode': pollcode,
            'values': inputString,
            'editmode': editMode.toString(),
            'valueid': vlaueId,
            'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
        },
        success : function(response){
            if(response.status == 'success'){
                progressBar.classList.remove('visible')
                errorMark.style.display = 'none'
                checkMark.style.display= 'block'
                messageModal.classList.add('visible')
            }
            else{

                progressBar.classList.remove('visible')
                errorMark.style.display = 'block'
                checkMark.style.display= 'none'
                messageModal.classList.add('visible')
            }
            
            txtMessage.textContent = response.message
        },
        error : function(response){
            console.log(response)
        }
    })

    
})

/** sets up the ui with input fields  */
function populateUi(fieldArray){
    
    fieldArray.forEach(function(item){
        console.log(item)
        if(item.datatype !== 'empty'){
            inputElement = document.createElement('input')
            inputElement.type = item.datatype
            inputElement.placeholder = item.name
            inputElement.required = item.required
            inputElement.name = item.name
            inputElement.id = item.name
            
           
            if(editMode){
                pollvalues.forEach((value)=>{
                    if(item.name == value.name){
                        inputElement.value = value.value
                    }
                })
            }
    
            inputContainer.appendChild(inputElement)
    
    
            inputArray.push(inputElement)
            
       }
    })
    
}

}
else{
    //user has provided the link of a poll which doesnt exist
    modalContainer.classList.add('visible')
}










