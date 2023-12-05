
document.addEventListener('DOMContentLoaded', function () {
    setupOpaqueModal('op-one', 'op-message-one', 'Fetching poll..') 

    const mInput = document.getElementById('in-poll-code');
    const inputContainer = document.querySelector('.input-container');
    const submitBtn = document.getElementById('submit');
    const valueIdInput = document.getElementById('value_id');
    const promptTxt = document.getElementById('prompt');
    const messageModal = document.querySelector('.message-modal');
    const checkMark = document.getElementById('check-mark');
    const errorMark = document.getElementById('error-mark');
    const removeMessageModal = document.getElementById('remove-message-modal');
    const txtMessage = document.getElementById('txt-message');
    const progressBar = document.getElementById('progress-bar');
    const responseModalCloseBtn = document.getElementById('response-close-btn')
    const btnSubmitResponse = document.getElementById('btn-submit-responses')

    let valueId = valueIdInput.value;
    let pollvalues;

    let editMode = false;


    class Input {
        constructor(name, value) {
            this.name = name;
            this.value = value;
        }
    }

    if (removeMessageModal !== null) {
        removeMessageModal.addEventListener('click', function () {
            messageModal.classList.remove('visible');
            location.reload();
        });
    }


    let pollcode = mInput.value;
    let inputArray = [];

    if(responseModalCloseBtn !== null){
        responseModalCloseBtn.addEventListener('click', function(){
            transitionModal('none')
        })
    }
    

    fetch('/getpoll/' + pollcode + '/' + valueId + '/')
        .then(response => response.json())
        .then(data => {
            console.log('fetch has returned')
            transitionModal('none')
            let fieldArray = JSON.parse(JSON.parse(data.fields));

            if (data.values !== 'empty') {
                editMode = true;
                // pollvalues = JSON.parse(data.values[0].fields.field_values);
                pollvalues = JSON.parse(JSON.parse(data.values)[0].fields.field_values)

                populateUi(fieldArray);
                promptTxt.textContent = 'Modify your entries';
                submitBtn.value = 'Save';
            } else {
                editMode = false;
                populateUi(fieldArray);
            }
        })
        .catch(error => console.error('Error:', error));

    
    submitForm = document.querySelector('#submit-form')
    if (submitForm !== null){
        submitForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // progressBar.classList.add('visible');
            // submitBtn.disabled = true;
            // submitResponse()

            let inputValueArray = inputArray.map(item => new Input(item.name, item.value));
            oneFieldPresent = checkForValue(inputValueArray)
            if(oneFieldPresent){
                transitionModal('response-review-modal')
                populateResponseReview(inputValueArray)
            }
            else{
                showAlertModalOneAction('Please provide input for at least one field', function(){
                    clearAllDynamicModals()
                })
            }
        });
    }
    
    function submitResponse(){
        let inputValueArray = inputArray.map(item => new Input(item.name, item.value));
        let inputString = JSON.stringify(inputValueArray);
        var csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

        let formData = new FormData();
        formData.append('pollcode', pollcode)
        formData.append('values', inputString)
        formData.append('editmode', editMode.toString())
        formData.append('valueid', valueId)

        
        fetch('/savevalue', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken 
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            transitionModal('none')
            let imagePath;
            let mainMessage;
            let subMessage; 
            if (data.status === 'success') {
                 imagePath = '/static/img/rocket-stars.svg'
                 mainMessage = 'Response on its way!'
                 subMessage =  `Your response has been recorded successfully. Thanks for your participation.`

            } else {
                 imagePath = '/static/img/sad-roach.svg'
                 mainMessage = 'Something went wrong!'
                 subMessage = 'An error occured while trying to submit your response, please try again.'
            }

            showAlertModalImageAction(mainMessage, subMessage, function(){
                clearAllDynamicModals()
                window.location.reload()
            }, imagePath)

        })
        .catch(error => console.error('Error:', error));
    }

    function populateResponseReview(inputValueArray){
        const responseContainer = document.querySelector('.responses-container')
        responseContainer.innerHTML = '';//clearing all the child elements of the response container
        inputValueArray.forEach((inputValue)=>{
            if(inputValue.value !== ''){
                const responseElement = `<div class="response">
                <p class="res-name"><b>${inputValue.name}:</b></p>
                <p class="res-answer">${inputValue.value}</p>
            </div>`
                responseContainer.innerHTML += responseElement;
            }
          
        })


        btnSubmitResponse.onclick = function (){
            btnSubmitResponse.disabled = true
            submitResponse()
        }
    }

    /**this function checks if at least one input was filled */
    function checkForValue(inputValueArray) {
        for (const inputValue of inputValueArray) {
            if (inputValue.value !== '') {
                console.log('ran this');
                return true; //breaking out of the loop when we find at least one input that has a value
            }
        }
        return false;
    }
    


    
    function populateUi(fieldArray) {
        console.log('populating the ui')
        fieldArray.forEach(item => {
            if (item.datatype !== 'empty') {
                let inputElement = document.createElement("input");
                if(inputElement !== null){
     
                    inputElement.type = item.datatype;
                    inputElement.placeholder = item.name;
                    inputElement.required = item.required;
                    inputElement.name = item.name;
                    inputElement.id = item.name;
                    inputElement.classList.add('enter-input')
    
                    if (editMode) {
                        let matchingValue = pollvalues.find(value => value.name === item.name);
                        if (matchingValue) {
                            inputElement.value = matchingValue.value;
                        }
                    }
                    
                    console.log(inputElement)
                    if(inputContainer !== null){
                        inputContainer.appendChild(inputElement);
                        inputArray.push(inputElement);
                    }
                    
                }
           
            }
        });
    }
    
});