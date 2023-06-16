
const browseFile = document.getElementById('browse-file')
const fileName = document.getElementById('file-name')
const cancelFile = document.getElementById('cancel-file')
const fileInput = document.getElementById('file')
const publishPoll = document.getElementById('publish-poll')

const tableContainer = document.querySelector('.table-container')
const modalContainer = document.getElementById('modal-container')
const progressContainer = document.getElementById('progress-container')
const resultContainer = document.getElementById('result-container')
const warningContainer = document.getElementById('warning-div')

const showSample = document.getElementById('example-dg-text')
const showSampleModal = document.getElementById('ex-dg-modal')
const removeSample = document.getElementById('remove-ex-dg')
const copyPollToolText = document.getElementById('copy-poll-tooltip-text')

showSample.addEventListener('click', function(e){
    showSampleModal.classList.add('visible')
})

removeSample.addEventListener('click', function(){
    showSampleModal.classList.remove('visible')
})

// modalContainer.classList.remove('visible')

let pollData = JSON.parse(localStorage.getItem('pollData'))
let pollDataStr = localStorage.getItem('pollData')
console.log(pollData)


let prevTable = '<table><thead><tr>'

let headers = Object.values(pollData[0])

pollData.forEach(function(data){
    if (data.datatype == 'empty'){
        prevTable += `<th id="empty-header"> </th>`
    }
    else{
        prevTable += '<th>' + data.name + '</th>'

    }
})

prevTable += "</tr></thead><tbody>"

for(let i=0; i<pollData.length; i++){
    prevTable += '<td> - </td>'
}

prevTable += '</table>'
tableContainer.innerHTML = prevTable


function handleDragOver(event){
    event.preventDefault()
}
function handleDrop(event){
    event.preventDefault()
    let files = event.dataTransfer.files
   
    let fileExtension = getFileExtension(files[0].name)
    if(fileExtension !== 'doc' || fileExtension !== 'docx'){
        alert('Invalid file, try providing a .doc or .docx file ')
    }
    else{
    fileInput.files = files
    let name = fileInput.files[0].name
    fileName.textContent = name
    }
   
}

function getFileExtension(filename){
  
    console.log(filename)

    let dotIndex = filename.lastIndexOf('.')
    if(dotIndex !== -1 && dotIndex !== filename.length -1){
        const extension = filename.substring(dotIndex +1)
        return extension
    }
    else{
        return "-"
    }
}

function openFileChooser(){
    fileInput.click()
}

document.getElementById('file').addEventListener('change', function(){
    let filename = this.files[0].name
    fileName.textContent = filename
})

cancelFile.addEventListener('click', function(){
    fileInput.value = null
    fileName.textContent = 'No file Chosen'
})

browseFile.addEventListener('click', openFileChooser)


$(document).on('submit', '#publish-form', function(e){
    e.preventDefault()
    //showing the progress bar
    modalContainer.classList.add('visible')
    progressContainer.classList.add('visible')
    let pollcode = genereatePollCode()
    let serverLink = 'http://127.0.0.1:8000/regpoll/'
    let polLink = serverLink + pollcode+ '/'

    //preparing the data to be sent  
    let mData = new FormData()
    mData.append('poll-name', $('#poll-name').val())
    mData.append('poll_data', pollDataStr)
    mData.append('poll_code', pollcode)
    mData.append('document', fileInput.files[0])
    mData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val())
    
    $.ajax({
        type: 'POST',
        url: '/publish',
        data: mData,
        contentType: false,
        processData: false,
            
        success: function(data){
           if(data.status == 'success'){
            warningContainer.classList.remove('visible')
            progressContainer.classList.remove('visible')
           resultContainer.classList.add('visible')

           //removing the modal container on click of the done button
           const btnDone = document.getElementById('btn-done')
           btnDone.addEventListener('click', function(){
            modalContainer.classList.remove('visible')
           })


           const copyCode = document.getElementById('copy-poll-code')
           copyCode.addEventListener('click', function(){
            navigator.clipboard.writeText(data.pollcode).then(() =>{
                copyPollToolText.textContent = 'Copied'

                setTimeout(function(){
                    copyPollToolText.textContent = 'Copy poll code'
                }, 1300)
            })
            .catch((error)=>{
                console.error('Fialed to copy text', error)
            })
           })

           const copyLink = document.getElementById('copy-poll-link')
           const copyLinkTool = document.getElementById('copy-link-tooltip-text')
           copyLink.addEventListener('click', function(){
                navigator.clipboard.writeText(polLink).then(()=> {
                    copyLinkTool.textContent = 'Copied'
                    setTimeout(function(){
                        copyLinkTool.textContent = 'Copy poll link'
                    }, 1300)
                })
                .catch((error) => {
                    console.error('Failed to copy text ', error)
                })
           })

           const txtPollCode = document.getElementById('txt-poll-code')
           const txtPollLink = document.getElementById('txt-poll-link')
           const txtPollName = document.getElementById('txt-poll-name')
           const txtPollAuthor = document.getElementById('txt-poll-owner')

           txtPollCode.textContent = data.pollcode
           txtPollName.textContent = data.pollname
           txtPollAuthor.textContent = data.pollauthor
           txtPollLink.textContent = polLink

           }
           else{
            resultContainer.classList.remove('visible')
            progressContainer.classList.remove('visible')
            warningContainer.classList.add('visible')
            const warningMessage = document.getElementById('warning-messsage')
            warningMessage.textContent = data.message

            //removing the modal container on click of the done button
            const btnDone = document.getElementById('warn-done')
            btnDone.addEventListener('click', function(){
            modalContainer.classList.remove('visible')
            })
           }

           
        },
        error: function(response){
            //hidding the modal container and the progress container if the query fails
            alert('An error occured please try again')
            progressContainer.classList.remove('visible')
            modalContainer.classList.remove('visible')

        }
    })
})

/** this function generates a poll code which will resemble DG-IU9085 */
function genereatePollCode(){
    let randomNumbers = generateRandomNumbers()
    let randomLetters = generateRandomLetters()



    let pollCode = `DG-${randomLetters}${randomNumbers}`
    return pollCode
}

function generateRandomNumbers(){
    /** Math.random generates a random number from 0 to 1, multiplying this random number by 9000 we generate a random number from 0 to 9000
     * 1000 is being added to this number to ensure that the result is between 1000 and 9000
     * flooring it to ensuree the returned number is not decimal 
     */
    return Math.floor(1000 + Math.random() * 9000)
}

/** generates two random letters */
function generateRandomLetters(){
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    //getting a random letters
    const randomLetter1 = letters.charAt(Math.floor(Math.random() * letters.length));
    const randomLetter2 = letters.charAt(Math.floor(Math.random() * letters.length));
    return randomLetter1 + randomLetter2
}



