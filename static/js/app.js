const mobile = document.getElementById('mobile')
const nav = document.querySelector('.nav-bar')
const header = document.querySelector('.header')
const bar = document.getElementById('bar')
let modalContainer = document.getElementById('modal-container')
const btnNewForm = document.querySelector('.btn-new-form')
let submitBtn = document.getElementById('submit-btn')
let loadingForm = document.querySelector('.loading-form-div')
const notFoundModal = document.querySelector('.not-found-modal')
const removeNotFoundModal = document.getElementById('remove-not-found-modal')



 
document.addEventListener('DOMContentLoaded', function(){

const contactForm = document.getElementById('contact-form')
contactForm.addEventListener('submit', function(e){
    e.preventDefault()
    setupLoadingModal('v2-loading-modal','loading-text', 'Sending mail..')

    let formData = new FormData(this)
    var csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;


    fetch('/sendemail', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken 
        },
        body: formData

    }).then(response => {
        if(!response.ok){

            let message = 'Something went wrong while sending the mail, please check your internet connection and try again'
            setUpAlertModalOneAction('v2-alert-modal-1a', 'res',message, ()=>{
                transitionModal('none')
            } , 'Ok' )
        }
        else{
            transitionModal('contact-confirmation-modal')
        }
        return response.json()
    })
    
})

// Check if the browser supports smooth scrolling
if ('scrollBehavior' in document.documentElement.style) {
    // Smooth scrolling is supported, enable it
    document.documentElement.style.scrollBehavior = 'smooth';
  }
  

btnNewForm.addEventListener('click', function(e){
    localStorage.setItem('screen-id', 'new-form')
    window.location.href = '/dashboard'
})
mobile.addEventListener('click', ()=>{
   header.classList.toggle('open')
  
   if(header.classList.contains('open')){
    nav.style.height = `${nav.scrollHeight}px`
    bar.classList.replace('fa-bars', 'fa-xmark')
    
   }
   else{
    nav.style.height = '0px'
    bar.classList.replace('fa-xmark', 'fa-bars')
   }
})

removeNotFoundModal.addEventListener('click', ()=>{
    notFoundModal.classList.remove('visible')
})

})

$(document).on('submit', '#find-form-form', function(e){
    e.preventDefault()
    submitBtn.disabled = true
    loadingForm.classList.add('visible')
    $.ajax({
        type: 'POST',
        url: '/findform',
        data: {
            'formcode': $('#form-code').val(),
            'csrfmiddlewaretoken' : $('input[name=csrfmiddlewaretoken]').val()
        },
        success: function(data){
            submitBtn.disabled= false
            loadingForm.classList.remove('visible')
            if(data.status== 'success'){
                    modalContainer.classList.add('visible')
                    let content = `<div class="result-container">
                    <div class="left-content">
                        <div class="det">
                            <h4 class="p-name" id="p-name">Prepar</h4>
                        </div>
                        <div class="det">
                            <i class="fa-regular fa-user"></i>
                            <p class="p-author" id="p-author">Udochukwu</p>
                        </div>
                        <div class="det">
                            <i class="fa-solid fa-key"></i>
                            <p class="p-code" id="p-code">DG-UI89756</p>
                        </div>
                    </div>
        
                    <div class="right-content">
                        <button id="btn-go">Go</button>
                        <button id="btn-cancel">Cancel</button>
                    </div>
                </div>`
        
                let modalBox = document.querySelector('.modal-box')
                modalBox.innerHTML = content
        
                let btnCancel = document.getElementById('btn-cancel')
                btnCancel.addEventListener('click', function(){
                    modalContainer.classList.remove('visible')
                })
        
                let pName = document.getElementById('p-name')
                let pAuthor = document.getElementById('p-author')
                let pCode = document.getElementById('p-code')
        
                pName.textContent = data.formname
                pAuthor.textContent = data.formauthor
                pCode.textContent = data.formcode

                let btnGo = document.getElementById('btn-go')
                btnGo.addEventListener('click', function(){
                    window.location.href ='/regform/' + data.formcode + '/nb/' 
                })
            }
            else{
                if(data.message == 'n_f'){
                    //this means that the form is not found
                    modalContainer.classList.add('visible')
                    const content = `   <div class="warning-div">
                    <p id="warning-message">Form does not exist, check your form code and try again</p>
                    <button id="btn-ok">Ok</button>
                </div>`
    
                    let modalBox = document.querySelector('.modal-box')
                    modalBox.innerHTML = content
        
                    const btnOk = document.getElementById('btn-ok')
                    btnOk.addEventListener('click', ()=>{
                        modalContainer.classList.remove('visible')
                    })
                }
                else if(data.message = 'un_auth'){
                    //this means that the user is not authenticated
                    notFoundModal.classList.add('visible')
                }
            }
           
        },
        error: function(data){
            loadingForm.classList.remove('visible')
            submitBtn.disabled = false
            alert(data)
        }
    })
})









